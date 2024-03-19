namespace API.Helpers
{
    public enum StatusRequesAuthor
    {
        SendRequest = 0,
        Contact = 1,
        Accept = 2,
        Deny = 3
    }

    public enum ReportErrorCode
    {
        ImageError = 1,
        DublicateChapter = 2,
        WrongComicUpload = 3,
    }
}