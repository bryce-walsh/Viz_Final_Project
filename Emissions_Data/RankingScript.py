import pandas as pd 
import country_converter as coco
pd = pd.read_csv('Emissions_with_ISO3.csv')
pd = pd.set_index('ISO3')
pd = pd.rank(ascending = False).reset_index()
pd.to_csv('emissions_rankings.csv')