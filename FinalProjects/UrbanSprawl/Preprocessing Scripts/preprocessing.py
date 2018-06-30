import pandas as pd

#df = pd.read_csv("EPA.csv", sep=',', encoding='ISO-8859-1')
#df2 = pd.read_csv("PopDensity.csv", sep=',', encoding='ISO-8859-1')

#current_df = pd.merge(df, df2, how='left', on=['MSA GEOID'])
#current_df.to_csv("Data.csv", sep=',', index=False)

#df = pd.read_csv("cb_2013_us_cbsa_5m.csv", sep=',', encoding='ISO-8859-1')
#df = df["name"].str.split(',', expand=True)
#df.to_csv("Test.csv", sep=',', index=False)



#   var far_west = new Set(["CA", "OR", "WA", "NV"]);
#    var rocky_mountain = new Set(["ID", "MT", "WY", "UT", "CO"]);
#     var plains = new Set(["ND", "SD", "NE", "KS", "MN", "IA", "MO"]);
#      var southwest = new Set(["AZ", "NM", "TX", "OK"]);
#       var great_lakes = new Set(["WI", "MI", "IL", "IN", "OH"]);
#        var southeast = new Set(["AR", "LA", "KY", "WV", "VA", "TN", "NC", "MS", "AL", "GA", "SC", "FL"]);
#         var mideast = new Set(["NY", "PA", "NJ", "DE", "MD", "DC"]);
#          var new_england = new Set(["ME", "NH", "VT", "MA", "RI", "CT"]);
#           var hawaii = new Set(["HI"]);
#            var alaska = new Set(["AK"]);

def region(state):
	if "CA" in state or "OR" in state or "WA" in state or "NV" in state or "HI" in state or "AK" in state:
		return "Far West"
	if "ID" in state or "MT" in state or "WY" in state or "UT" in state or "CO" in state:
		return "Rocky Mountain"
	if "ND" in state or "SD" in state or "NE" in state or "KS" in state or "MN" in state or "IA" in state or "MO" in state:
		return "Plains"
	if "AZ" in state or "NM" in state or "TX" in state or "OK" in state:
		return "Southwest"
	if "WI" in state or "MI" in state or "IL" in state or "IN" in state or "OH" in state:
		return "Great Lakes"
	if "AR" in state or "LA" in state or "KY" in state or "WV" in state or "VA" in state or "TN" in state or "NC" in state or "MS" in state or "AL" in state or "GA" in state or "SC" in state or "FL" in state:
		return "Southeast"
	if "NY" in state or "PA" in state or "NJ" in state or "DE" in state or "MD" in state or "DC" in state:
		return "Mideast"
	if "ME" in state or "NH" in state or "VT" in state or "MA" in state or "RI" in state or "CT" in state:
		return "New England"
	else:
		return "N/A"

#df = pd.read_csv("Test.csv", sep=',', encoding='ISO-8859-1')
#df['region'] = df['state(s)'].apply(region)
#df.to_csv("Rest.csv", sep=',', index=False)

df = pd.read_csv("Data.csv", sep=',', encoding='ISO-8859-1')
df2 = pd.read_csv("Rest.csv", sep=',', encoding='ISO-8859-1')
current_df = pd.merge(df[["MSA_GEOID", "region"]], df2, how='left', left_on='MSA_GEOID', right_on ='geoid')
current_df.to_csv("DataReg.csv", sep=',', index=False)
