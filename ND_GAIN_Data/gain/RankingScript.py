import pandas as pd 
import country_converter as coco
pd = pd.read_csv('gain_no_nans.csv')
pd = pd.set_index('ISO3')
pd = pd.rank().reset_index()
pd.to_csv('gain_rankings.csv')