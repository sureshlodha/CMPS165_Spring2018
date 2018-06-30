# -*- coding: utf-8 -*-
"""
Created on Sun May 27 19:32:36 2018

@author: Sarkar
"""

import os
os.chdir('C:/Users/Sarkar/Documents/Gautam')

import pandas as pd

data2000 = pd.read_csv('2000.csv', encoding='ISO-8859-1')
data2010 = pd.read_csv('2010.csv', encoding='ISO-8859-1')
data2000['MSA'] = data2000['MSA'].str.replace('--','-').str.replace('PMSA', 'MSA').str.replace('CMSA', 'MSA')
data2010['MSA'] = data2010['MSA'].str.replace('--','-').str.replace('PMSA', 'MSA').str.replace('CMSA', 'MSA')
data2000['Geographical Area'] = data2000['Geographical Area'].str.replace('--','-').str.replace('PMSA', 'MSA').str.replace('CMSA', 'MSA')
data2010['Geographical Area'] = data2010['Geographical Area'].str.replace('--','-').str.replace('PMSA', 'MSA').str.replace('CMSA', 'MSA')

dataCensus = pd.merge(data2000, data2010, how='outer', on='MSA')
dataCensus.to_csv('Census2.csv', index=False)

dataEPA = pd.read_csv('EPA.csv', encoding='ISO-8859-1')
dataIds = dataEPA[['CBSA', 'Core Based Statistical Area']]
dataIds.dropna(axis=0, how='any', inplace=True)
dataEPA = pd.merge(dataEPA, dataIds, how='left', on='CBSA')
dataEPA.to_csv('EPA2.csv', index=False)

data = pd.merge(dataEPA, dataCensus, how='left', left_on='CBSA', right_on='Target Geo Id2 2010')
data.to_csv('EPACensus20002010Num1.csv', index=False)
print('done')