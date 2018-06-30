# -*- coding: utf-8 -*-
"""
Created on Fri Jun 01 22:16:35 2018

@author: Thomas
"""

import csv

with open('NHLInjuryData.csv', 'r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    
    data = []
    #labels = dict(
    #        injury_type: "",
    #        num_injuries: 0,
    #        total_severity: 0,
    #        injuries_d: 0,
    #        injuries_f: 0,
    #        injuries_g: 0
    #        )
    
    for line in csv_reader:
        row = filter(lambda injury: injury['injury_type'] == line["Injury Type"], data)
        if row == []:
            row = {}
            row["injury_type"] = line["Injury Type"]
            row["num_injuries"] = 1
            row["total_severity"] = int(line["Games Missed"])
            if line["Position"] == "D":
                row["injuries_d"] = 1
                row["injuries_f"] = 0
                row["injuries_g"] = 0
            elif line["Position"] == "F":
                row["injuries_d"] = 0
                row["injuries_f"] = 1
                row["injuries_g"] = 0
            else:
                row["injuries_d"] = 0
                row["injuries_f"] = 0
                row["injuries_g"] = 1   
            data.append(row)
        else:
            row = row[0]
            row["num_injuries"] = row["num_injuries"] + 1
            row["total_severity"] += int(line["Games Missed"])
            if line["Position"] == "D":
                row["injuries_d"] += 1
            elif line["Position"] == "F":
                row["injuries_f"] += 1
            else:
                row["injuries_g"] += 1
                
        
    keys = data[0].keys()
    with open('AggregateInjuries.csv', 'wb') as output_file:
        dict_writer = csv.DictWriter(output_file, keys)
        dict_writer.writeheader()
        dict_writer.writerows(data)
        

