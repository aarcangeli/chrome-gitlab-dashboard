import { BookmarkIcon, BookmarkFillIcon } from "@primer/octicons-react";
import { Box } from "@primer/react";
import "./BookmarkButton.scss";

interface Props {
  bookmarked?: boolean;
  onClick?: () => void;
}

export function BookmarkButton(props: Props) {
  return (
    <Box className="book-mark-wrap" onClick={props.onClick}>
      <BookmarkIcon size="small" />
      <BookmarkFillIcon className={props.bookmarked ? "" : "hide"} size="small" />
    </Box>
  );
}
