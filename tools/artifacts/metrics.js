// The full metric set, grouped by rung. `lower` marks a metric where a FALL is
// the good direction (bounce, errors, crashes, listing rejection, memory, CPU).
// `unit` drives formatting so a rate is never printed as a count and a Robux
// figure is never printed as a percentage.
module.exports = [
  // ---- Reach: is Roblox still showing it, and does the listing convert ----
  ["Reach","Impressions (unique users)","UniqueUsersWithImpressions","int",false],
  ["Reach","Visits","Visits","int",false],
  ["Reach","Impression→play CVR","EndToEndCVR","pct",false],
  ["Reach","RFY play-through rate","RFYPlayThroughRate","pct",false],
  ["Reach","RFY qualified PTR","RFYQualifiedPTR","pct",false],
  ["Reach","Listing rejections / M impressions","RFYUniqueNotInterestedUsersPerMillionImpressions","num1",true],

  // ---- Audience ----
  ["Audience","DAU","DailyActiveUsers","int",false],
  ["Audience","Unique users with plays","UniqueUsersWithPlaySessions","int",false],
  ["Audience","Peak concurrents","PeakConcurrentPlayers","int",false],
  ["Audience","MAU","MonthlyActiveUsers","int",false],
  ["Audience","DAU / MAU stickiness","DauMauStickiness","pct",false],

  // ---- Hook: the first session ----
  ["First session","D1 retention","ForwardD1Retention","pct",false],
  ["First session","Attribution D1 retention","AttributionD1RetentionRatio","pct",false],
  ["First session","Session length (min)","AverageSessionLengthMinutes","min",false],
  ["First session","Session duration (s)","SessionDurationSecondsAvg","int",false],
  ["First session","Play min per DAU","AveragePlayTimeMinutesPerDAU","min",false],
  ["First session","Total play hours","TotalPlayTimeHours","int",false],
  ["First session","RFY bounce <60s","RFYDuration0To60","pct",true],
  ["First session","RFY bounce 60–180s","RFYDuration61To180","pct",true],
  ["First session","RFY D1 playtime","RFYD1Playtime","num2",false],
  ["First session","RFY D1 qualified sessions","RFYD1QualifiedPlaySessions","num3",false],
  ["First session","RFY D1 co-play days","RFYD1CoplayDays","num3",false],

  // ---- Return loop ----
  ["Return loop","RFY L7 play days","RFYL7PlayDays","num3",false],
  ["Return loop","RFY D2–7 play days","RFYD2To7PlayDays","num3",false],
  ["Return loop","RFY D2–7 playtime","RFYD2To7Playtime","num2",false],
  ["Return loop","RFY D2–7 qualified sessions","RFYD2To7QualifiedPlaySessions","num3",false],
  ["Return loop","RFY D2–7 co-play days","RFYD2To7CoplayDays","num3",false],
  ["Return loop","RFY D8–28 play days","RFYD8To28PlayDays","num3",false],
  ["Return loop","RFY D8–28 playtime","RFYD8To28Playtime","num2",false],
  ["Return loop","RFY D8–28 qualified sessions","RFYD8To28QualifiedPlaySessions","num3",false],

  // ---- Money ----
  ["Money","Revenue","DailyRevenue","robux0",false],
  ["Money","ARPU","AverageRevenuePerUser","robux",false],
  ["Money","ARPPU","AverageRevenuePerPayingUser","robux",false],
  ["Money","Paying users","PayingUsers","int",false],
  ["Money","Paying-user CVR","PayingUsersCVR","pct",false],
  ["Money","RFY D1 Robux spend","RFYD1RobuxSpend","num2",false],
  ["Money","RFY D1 spend days","RFYD1SpendDay","num3",false],
  ["Money","RFY D2–7 Robux spend","RFYD2To7RobuxSpend","num2",false],
  ["Money","RFY D2–7 spend days","RFYD2To7SpendDays","num3",false],


  // ---- Sentiment ----
  ["Sentiment","Feedback votes","PlayerFeedbackVotesCount","int",false],
];
