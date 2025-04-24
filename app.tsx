UniquePersonRoles =
SUMMARIZE(
    PersonnelData,
    PersonnelData[PersonName],
    PersonnelData[RoleName],
    "TargetAudits", MAX(PersonnelData[TargetAudits]),
    "CompletedAudits", MAX(PersonnelData[CompletedAudits])
)
