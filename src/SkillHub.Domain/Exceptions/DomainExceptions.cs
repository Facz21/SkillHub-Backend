namespace SkillHub.Domain.Exceptions;

public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}

public class NotFoundException : DomainException
{
    public NotFoundException(string message) : base(message) { }
}

public class CapacityExceededException : DomainException
{
    public CapacityExceededException(string message) : base(message) { }
}

public class DuplicateEnrollmentException : DomainException
{
    public DuplicateEnrollmentException(string message) : base(message) { }
}

public class ScheduleConflictException : DomainException
{
    public ScheduleConflictException(string message) : base(message) { }
}

public class CancellationNotAllowedException : DomainException
{
    public CancellationNotAllowedException(string message) : base(message) { }
}

public class BusinessRuleValidationException : DomainException
{
    public BusinessRuleValidationException(string message) : base(message) { }
}
