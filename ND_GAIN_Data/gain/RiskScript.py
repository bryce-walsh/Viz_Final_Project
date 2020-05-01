import pandas as pd 
pd = pd.read_csv('gain_no_nans.csv')
pd = pd.set_index('ISO3')
pd = (100 - pd).round(decimals = 2)
print(pd)
pd.to_csv('risk.csv')