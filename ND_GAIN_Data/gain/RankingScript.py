import pandas as pd 
import country_converter as coco
pd = pd.read_csv('risk.csv')
pd = pd.set_index('ISO3')
pd = pd.rank(ascending = False).reset_index()
print(pd)
pd.to_csv('risk_rankings.csv')