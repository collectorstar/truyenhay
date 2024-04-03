export enum StatusRequesAuthor {
  SendRequest = 0,
  Contact = 1,
  Accept = 2,
  Deny = 3,
}

export enum ReportErrorCode {
  ImageError = 1,
  DublicateChapter = 2,
  WrongComicUpload = 3,
  Other = 4,
}

export enum ApprovalStatusComic {
  Waiting = 0,
  Accept = 1,
  Deny = 2,
}

export enum RequestIncMaxComicStatus {
  Waiting = 0,
  Accept = 1,
  Deny = 2,
}

export enum ApprovalStatusChapter {
  Waiting = 0,
  Accept = 1,
  Deny = 2,
}

export enum NotifyType {
  RequestAuthor = 0,
  ApprovalComic = 1,
  ApprovalChapter = 2,
  RequestIncMaxComic = 3,
  FixDoneChapter = 4
}
