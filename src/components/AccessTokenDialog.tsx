import React, { useId, useRef, useState } from "react";
import { Box, Button, Dialog, FormControl, Link, Spinner, TextInput } from "@primer/react";
import { PersistentStorage } from "@src/services/PersistentStorage";
import { makeGitLabApi } from "@src/services/GitLabApiImpl";
import { GitLabUser } from "@src/services/GitLabApi";

class AccessTokenDialogProps {
  isInitiallyOpen? = false;
  storage: PersistentStorage;
  onSaved?: (gitLabUser: GitLabUser) => void;
}

enum TokenErrorType {
  None,
  Missing,
  Invalid,
  PermissionDenied,
}

export default function AccessTokenDialog(props: AccessTokenDialogProps) {
  const [isOpen, setIsOpen] = useState(props.isInitiallyOpen);
  const returnFocusRef = useRef(null);
  const tokenInput = useRef<HTMLInputElement>(null);
  const id = useId();

  const [host, setHost] = useState(props.storage.getHost());
  const [token, setToken] = useState("");
  const [tokenError, setTokenError] = useState(TokenErrorType.None);
  const [isValidating, setIsValidating] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const afterPaste = useRef(false);

  // When changed, the validation must be stopped
  const validationVersion = useRef(0);

  function reset() {
    validationVersion.current++;
    setHost(props.storage.getHost());
    setToken(props.storage.isAccessTokenSet() ? "********" : "");
    setTokenError(TokenErrorType.None);
    setIsFormChanged(false);
    setIsValidating(false);
  }

  function openDialog() {
    reset();
    setIsOpen(true);
  }

  function closeDialog() {
    validationVersion.current++;
    setIsOpen(false);
  }

  function onHostChange(newHost: string) {
    if (afterPaste.current) {
      const match = newHost.match(/^https?:\/\/([\w.]+)/);
      if (match) {
        newHost = match[1];
      }
    }
    setHost(newHost);
    afterPaste.current = false;
    setIsFormChanged(true);
  }

  function onTokenChange(newToken: string) {
    setToken(newToken);
    setTokenError(TokenErrorType.None);
    setIsFormChanged(true);
  }

  async function submit() {
    setIsValidating(true);
    const version = ++validationVersion.current;

    try {
      const actualHost = host || "gitlab.com";
      setTokenError(TokenErrorType.None);

      if (!isFormChanged) {
        setIsOpen(false);
        return;
      }

      if (!token) {
        setTokenError(TokenErrorType.Missing);
        tokenInput.current.focus();
        return;
      }

      // verify token
      let user: GitLabUser;
      try {
        user = await makeGitLabApi(actualHost, token).currentUser();
        if (version !== validationVersion.current) return;
      } catch (e) {
        if (version !== validationVersion.current) return;
        console.error("Unable to verify token on host " + host, e);
        setTokenError(TokenErrorType.Invalid);
        return;
      }

      // request permission
      if (chrome) {
        const permission = {
          origins: [`https://${actualHost}/*`],
        };
        const granted = await new Promise<boolean>((resolve) => {
          chrome.permissions.request(permission, (granted) => {
            resolve(granted);
          });
        });
        if (!granted) {
          setTokenError(TokenErrorType.PermissionDenied);
          return;
        }
      }

      // save
      closeDialog();
      props.storage.init(host, token, user.id);
      props.onSaved?.(user);
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <>
      <Button ref={returnFocusRef} onClick={openDialog}>
        Change GitLab Private Access Token (PAT)
      </Button>
      <Dialog returnFocusRef={returnFocusRef} initialFocusRef={tokenInput} isOpen={isOpen} onDismiss={closeDialog} aria-labelledby={id}>
        <Dialog.Header id={id}>Access token</Dialog.Header>

        <Box p={3} display="flex" flexDirection="column" sx={{ gap: 2 }}>
          {/* Host */}
          <FormControl required>
            <FormControl.Label>Host</FormControl.Label>
            <TextInput block placeholder="gitlab.com" value={host} onChange={(e) => onHostChange(e.currentTarget.value)} onPaste={() => (afterPaste.current = true)} />
          </FormControl>

          {/* Token */}
          <FormControl required>
            <FormControl.Label>Private Access Token</FormControl.Label>
            <TextInput block ref={tokenInput} type="password" value={token} onChange={(e) => onTokenChange(e.currentTarget.value)} />
            <FormControl.Caption>The following scopes must be granted to the access token: [read_api]</FormControl.Caption>
            {tokenError === TokenErrorType.Missing && <FormControl.Validation variant="error">Enter a private token</FormControl.Validation>}
            {tokenError === TokenErrorType.Invalid && <FormControl.Validation variant="error">The provided token is not valid</FormControl.Validation>}
            {tokenError === TokenErrorType.PermissionDenied && <FormControl.Validation variant="error">The permission was not granted</FormControl.Validation>}
          </FormControl>

          <Box my={2}>
            Generate a new{" "}
            <Link target="_blank" href={`https://${host}/-/profile/personal_access_tokens?name=GL+Dashboard+Chrome+Extension&scopes=read_api`}>
              personal access tokens
            </Link>
          </Box>

          <Box my={2} display="flex" sx={{ gap: 2 }}>
            <Button variant="primary" onClick={submit} disabled={isValidating}>
              Save
            </Button>
            <Button onClick={closeDialog}>cancel</Button>
            {isValidating && <Spinner size="small" />}
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
