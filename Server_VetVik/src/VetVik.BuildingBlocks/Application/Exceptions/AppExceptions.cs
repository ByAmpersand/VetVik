namespace VetVik.BuildingBlocks.Application.Exceptions;

public abstract class AppException : Exception
{
    protected AppException(string message) : base(message) { }
}

public sealed class NotFoundException : AppException
{
    public NotFoundException(string entity, object key)
        : base($"{entity} with key '{key}' was not found.") { }

    public NotFoundException(string message) : base(message) { }
}

public sealed class ValidationAppException : AppException
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationAppException(IReadOnlyDictionary<string, string[]> errors)
        : base("One or more validation errors occurred.")
    {
        Errors = errors;
    }
}

public sealed class BusinessRuleException : AppException
{
    public BusinessRuleException(string message) : base(message) { }
}

public sealed class ForbiddenException : AppException
{
    public ForbiddenException(string message) : base(message) { }
}

public sealed class ConflictException : AppException
{
    public ConflictException(string message) : base(message) { }
}
