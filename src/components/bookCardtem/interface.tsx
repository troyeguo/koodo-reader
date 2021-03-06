import BookModel from "../../model/Book";
import { RouteComponentProps } from "react-router";

export interface BookCardProps extends RouteComponentProps<any> {
  book: BookModel;
  currentBook: BookModel;
  isOpenActionDialog: boolean;
  isDragToLove: boolean;
  isDragToDelete: boolean;
  dragItem: string;
  handleReadingBook: (book: BookModel) => void;
  handleActionDialog: (isShowActionDialog: boolean) => void;
  handleMessage: (message: string) => void;
  handleMessageBox: (isShow: boolean) => void;
  handleDragItem: (key: string) => void;
  handleDragToLove: (isDragToLove: boolean) => void;
  handleDragToDelete: (isDragToDelete: boolean) => void;
  handleDeleteDialog: (isShow: boolean) => void;
}
export interface BookCardState {
  isOpenConfig: boolean;
  isFavorite: boolean;
  left: number;
  top: number;
}
