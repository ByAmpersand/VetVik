using FluentAssertions;
using VetVik.Modules.Appointments.Application.Rules;
using VetVik.Modules.Appointments.Domain.Entities;
using VetVik.Modules.Appointments.Domain.Enums;
using VetVik.Modules.Clinic.Domain.Entities;
using VetVik.Modules.Doctors.Domain.Entities;

namespace VetVik.UnitTests;

/// <summary>
/// Tests for the pure business rules driving appointment scheduling.
/// These cover the appointment-overlap and working-hours logic that
/// the diploma defense will demo.
/// </summary>
public class AppointmentRulesTests
{
    private static DateTime At(int year, int month, int day, int h, int m) =>
        new(year, month, day, h, m, 0, DateTimeKind.Utc);

    [Fact]
    public void Overlaps_returns_true_for_partial_overlap()
    {
        AppointmentRules.Overlaps(
            At(2026, 6, 1, 10, 0), At(2026, 6, 1, 11, 0),
            At(2026, 6, 1, 10, 30), At(2026, 6, 1, 11, 30))
            .Should().BeTrue();
    }

    [Fact]
    public void Overlaps_returns_false_for_back_to_back_appointments()
    {
        AppointmentRules.Overlaps(
            At(2026, 6, 1, 10, 0), At(2026, 6, 1, 11, 0),
            At(2026, 6, 1, 11, 0), At(2026, 6, 1, 12, 0))
            .Should().BeFalse();
    }

    [Fact]
    public void TimeRangeIsValid_requires_end_after_start()
    {
        AppointmentRules.TimeRangeIsValid(At(2026, 6, 1, 10, 0), At(2026, 6, 1, 11, 0)).Should().BeTrue();
        AppointmentRules.TimeRangeIsValid(At(2026, 6, 1, 10, 0), At(2026, 6, 1, 10, 0)).Should().BeFalse();
    }

    [Fact]
    public void WithinClinicHours_passes_when_appointment_fits_into_open_day()
    {
        var hours = new[]
        {
            new ClinicWorkingHour
            {
                DayOfWeek = DayOfWeek.Monday,
                OpenTime = new TimeOnly(9, 0),
                CloseTime = new TimeOnly(18, 0),
                IsWorkingDay = true
            }
        };
        // 2026-06-01 is a Monday.
        AppointmentRules.WithinClinicHours(
            At(2026, 6, 1, 10, 0), At(2026, 6, 1, 11, 0), hours).Should().BeTrue();

        AppointmentRules.WithinClinicHours(
            At(2026, 6, 1, 8, 30), At(2026, 6, 1, 9, 30), hours).Should().BeFalse();
    }

    [Fact]
    public void WithinClinicHours_fails_on_non_working_day()
    {
        var hours = new[]
        {
            new ClinicWorkingHour
            {
                DayOfWeek = DayOfWeek.Sunday,
                OpenTime = new TimeOnly(0, 0),
                CloseTime = new TimeOnly(0, 0),
                IsWorkingDay = false
            }
        };
        // 2026-06-07 is a Sunday.
        AppointmentRules.WithinClinicHours(
            At(2026, 6, 7, 10, 0), At(2026, 6, 7, 11, 0), hours).Should().BeFalse();
    }

    [Fact]
    public void WithinDoctorHours_respects_isActive_flag()
    {
        var hours = new[]
        {
            new DoctorWorkingHour
            {
                DayOfWeek = DayOfWeek.Monday,
                StartTime = new TimeOnly(9, 0),
                EndTime = new TimeOnly(17, 0),
                IsActive = false
            }
        };
        AppointmentRules.WithinDoctorHours(
            At(2026, 6, 1, 10, 0), At(2026, 6, 1, 11, 0), hours).Should().BeFalse();
    }

    [Fact]
    public void ConflictsWith_ignores_cancelled_and_no_show_appointments()
    {
        var candidates = new[]
        {
            new Appointment
            {
                StartAt = At(2026, 6, 1, 10, 0),
                EndAt = At(2026, 6, 1, 11, 0),
                Status = AppointmentStatus.Cancelled
            },
            new Appointment
            {
                StartAt = At(2026, 6, 1, 10, 0),
                EndAt = At(2026, 6, 1, 11, 0),
                Status = AppointmentStatus.NoShow
            }
        };

        var conflicts = AppointmentRules.ConflictsWith(
            At(2026, 6, 1, 10, 30), At(2026, 6, 1, 11, 30), candidates).ToList();

        conflicts.Should().BeEmpty();
    }

    [Fact]
    public void ConflictsWith_flags_overlapping_scheduled_appointment()
    {
        var candidates = new[]
        {
            new Appointment
            {
                StartAt = At(2026, 6, 1, 10, 0),
                EndAt = At(2026, 6, 1, 11, 0),
                Status = AppointmentStatus.Scheduled
            }
        };

        var conflicts = AppointmentRules.ConflictsWith(
            At(2026, 6, 1, 10, 30), At(2026, 6, 1, 11, 30), candidates).ToList();

        conflicts.Should().HaveCount(1);
    }
}
