Attainment % = 
VAR CompletedObs = [TotalObservations]  -- Assuming you already have a measure to count completed observations
VAR TargetObs = [TotalTargetObservations]  -- Assuming you have a measure for total target observations
RETURN
IF(
    TargetObs > 0,  -- To avoid division by zero errors
    DIVIDE(CompletedObs, TargetObs, 0),  -- Calculate attainment percentage
    BLANK()  -- If no target, return blank
)
