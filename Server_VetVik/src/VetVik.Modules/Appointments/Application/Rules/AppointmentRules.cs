using VetVik.Modules.Appointments.Domain.Entities;
using VetVik.Modules.Appointments.Domain.Enums;
using VetVik.Modules.Clinic.Domain.Entities;
using VetVik.Modules.Doctors.Domain.Entities;

namespace VetVik.Modules.Appointments.Application.Rules;

/// <summary>
/// Pure functions encoding appointment business rules.
/// Kept dependency-free so they are trivial to unit-test.
/// </summary>
public static class AppointmentRules
{
    public static bool TimeRangeIsValid(DateTime startAt, DateTime endAt) => endAt > startAt;

    public static bool WithinSameLocalDay(DateTime startAt, DateTime endAt) =>
        startAt.Date == endAt.Date;

    public static bool WithinClinicHours(
        DateTime startAt, DateTime endAt, IEnumerable<ClinicWorkingHour> clinicHours)
    {
        var day = clinicHours.FirstOrDefault(h => h.DayOfWeek == startAt.DayOfWeek);
        if (day is null || !day.IsWorkingDay) return false;

        var startTod = TimeOnly.FromDateTime(startAt);
        var endTod = TimeOnly.FromDateTime(endAt);
        return startTod >= day.OpenTime && endTod <= day.CloseTime;
    }

    public static bool WithinDoctorHours(
        DateTime startAt, DateTime endAt, IEnumerable<DoctorWorkingHour> doctorHours)
    {
        var day = doctorHours.FirstOrDefault(h =>
            h.DayOfWeek == startAt.DayOfWeek && h.IsActive);
        if (day is null) return false;

        var startTod = TimeOnly.FromDateTime(startAt);
        var endTod = TimeOnly.FromDateTime(endAt);
        return startTod >= day.StartTime && endTod <= day.EndTime;
    }

    /// <summary>
    /// Half-open interval overlap test. Two appointments with the same start/end
    /// instant are NOT considered overlapping (back-to-back is allowed).
    /// </summary>
    public static bool Overlaps(
        DateTime aStart, DateTime aEnd,
        DateTime bStart, DateTime bEnd) =>
        aStart < bEnd && bStart < aEnd;

    /// <summary>
    /// Filters a list of "blocking" appointments to those that conflict with
    /// the supplied range. Cancelled and NoShow are filtered out by the caller
    /// via <see cref="AppointmentStatusExtensions.BlocksScheduling"/>.
    /// </summary>
    public static IEnumerable<Appointment> ConflictsWith(
        DateTime startAt, DateTime endAt, IEnumerable<Appointment> candidates) =>
        candidates
            .Where(a => a.Status.BlocksScheduling())
            .Where(a => Overlaps(startAt, endAt, a.StartAt, a.EndAt));
}
