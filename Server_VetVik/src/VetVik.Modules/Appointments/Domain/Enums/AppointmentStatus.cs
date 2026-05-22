namespace VetVik.Modules.Appointments.Domain.Enums;

public enum AppointmentStatus
{
    Scheduled = 0,
    Confirmed = 1,
    Completed = 2,
    Cancelled = 3,
    NoShow = 4
}

public static class AppointmentStatusExtensions
{
    /// <summary>
    /// Statuses that occupy a calendar slot and must not overlap with another booking
    /// for the same doctor/room.
    /// </summary>
    public static bool BlocksScheduling(this AppointmentStatus s) =>
        s is AppointmentStatus.Scheduled or AppointmentStatus.Confirmed or AppointmentStatus.Completed;
}
