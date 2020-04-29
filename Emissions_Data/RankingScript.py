import pandas as pd 
import country_converter as coco
pd = pd.read_csv('emissions_per_cap_no_nans.csv')
pd = pd.set_index('ISO3')
pd = pd.rank().reset_index()
pd.to_csv('emissions_per_cap_rankings.csv')