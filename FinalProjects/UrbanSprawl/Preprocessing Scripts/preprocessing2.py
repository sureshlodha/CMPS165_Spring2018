import pandas as pd
import numpy as np
import json

#df = pd.read_csv("EPA.csv", sep=',', encoding='ISO-8859-1')
#df2 = pd.read_csv("PopDensity.csv", sep=',', encoding='ISO-8859-1')

#current_df = pd.merge(df, df2, how='left', on=['MSA GEOID'])
#current_df.to_csv("Data.csv", sep=',', index=False)

#df = pd.read_csv("cb_2013_us_cbsa_5m.csv", sep=',', encoding='ISO-8859-1')
#df = df["name"].str.split(',', expand=True)
#df.to_csv("Test.csv", sep=',', index=False)


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
json_data = json.load(open('us-states.json', 'r'))
new_json = {}
new_json['type'] = 'FeatureCollection'
new_json['features'] = []

arr = {}
arr['type'] = 'Feature'
arr['id'] = '01'
arr['properties'] = {'region':'Mideast'}
arr['geometry'] = {'type':'MultiPolygon','coordinates':[]}
new_json['features'].append(arr)

arr = {}
arr['type'] = 'Feature'
arr['id'] = '02'
arr['properties'] = {'region':'Great Lakes'}
arr['geometry'] = {'type':'MultiPolygon','coordinates':[]}
new_json['features'].append(arr)

arr = {}
arr['type'] = 'Feature'
arr['id'] = '03'
arr['properties'] = {'region':'Southwest'}
arr['geometry'] = {'type':'MultiPolygon','coordinates':[]}
new_json['features'].append(arr)

arr = {}
arr['type'] = 'Feature'
arr['id'] = '04'
arr['properties'] = {'region':'Southeast'}
arr['geometry'] = {'type':'MultiPolygon','coordinates':[]}
new_json['features'].append(arr)

arr = {}
arr['type'] = 'Feature'
arr['id'] = '05'
arr['properties'] = {'region':'Far West'}
arr['geometry'] = {'type':'MultiPolygon','coordinates':[]}
new_json['features'].append(arr)

arr = {}
arr['type'] = 'Feature'
arr['id'] = '06'
arr['properties'] = {'region':'Plains'}
arr['geometry'] = {'type':'MultiPolygon','coordinates':[]}
new_json['features'].append(arr)

arr = {}
arr['type'] = 'Feature'
arr['id'] = '07'
arr['properties'] = {'region':'Rocky Mountain'}
arr['geometry'] = {'type':'MultiPolygon','coordinates':[]}
new_json['features'].append(arr)

arr = {}
arr['type'] = 'Feature'
arr['id'] = '08'
arr['properties'] = {'region':'New England'}
arr['geometry'] = {'type':'MultiPolygon', 'coordinates':[]}
new_json['features'].append(arr)

for feature in json_data['features']:
	properties = feature['properties']
	state = properties['state']
	region_val = region(state)
	geometry = feature['geometry']
	coordinates = geometry['coordinates']
	#print(coordinates[0])
	for i in range(0, 8):
		if region_val == new_json['features'][i]['properties']['region']:
			print(state + '  ' + region_val)
			cnt = cnt + 1
			new_json['features'][i]['geometry']['coordinates'].append(coordinates)
			break

with open('us-regions.json', 'w') as outfile:
    json.dump(new_json, outfile)

print(cnt)
