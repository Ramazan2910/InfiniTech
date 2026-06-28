namespace InfiniTech.Application.Common;

public class AppException : Exception
{
    public int StatusCode { get; }
    public string[] Details { get; }

    public AppException(int statusCode, string message, string[]? details = null)
        : base(message)
    {
        StatusCode = statusCode;
        Details = details ?? [];
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string message) : base(404, message) { }
}

public class ConflictException : AppException
{
    public ConflictException(string message) : base(409, message) { }
}

public class BadRequestException : AppException
{
    public BadRequestException(string message, string[]? details = null)
        : base(400, message, details) { }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string message = "Access denied") : base(403, message) { }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "Неверный email или пароль") : base(401, message) { }
}
