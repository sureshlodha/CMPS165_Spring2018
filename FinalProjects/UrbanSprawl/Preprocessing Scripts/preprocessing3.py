import pandas as pd
import numpy as np
import json

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
import math
cnt = 0
json_data = json.load(open('cb_2013_us_cbsa_5m.json', 'r'))
new_json = {}
new_json['type'] = 'FeatureCollection'
new_json['features'] = []
for feature in json_data['features']:
	properties = feature['properties']
	msanum = properties['geoid']
	found = any(df['MSA_GEOID'] == int(msanum))
	if found:
		cnt = cnt + 1
		df_subset = df.loc[(df['MSA_GEOID'] == int(msanum))]
		row_select = df_subset.iloc[0]
		#print(row_select)
		for column in df:
			if column != "MSA_GEOID" and column != "Core Based Statistical Area":
				try:
					num = np.asscalar(row_select[column])
					if math.isnan(num):
						properties[column] = -1
					else:
						properties[column] =  np.asscalar(row_select[column])
				except:
					properties[column] =  (row_select[column])
		new_json['features'].append(feature)
		
	#print(found)
	#print(property)
	
with open('cb_2013_us_cbsa_5m(2).json', 'w') as outfile:
    json.dump(new_json, outfile)

print(cnt)

