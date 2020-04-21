import pandas as pd 
import country_converter as coco
emissions = pd.read_csv('historical_emissions.csv')

emissions['ISO3'] = emissions['Country'].apply(lambda x: coco.convert(names=x, to='ISO3'))
emissions = emissions[emissions.ISO3 != 'not found']

population = pd.read_csv('../Population_Data/Population_by_country.csv')
emissions_per_cap = pd.DataFrame()
emissions_per_cap['ISO3'] = population['ISO3']
emissions_per_cap = emissions_per_cap.set_index('ISO3')
print(emissions_per_cap)


for year in range(1995, 2017):
	year_col = (emissions.set_index('ISO3')[str(year)] * 1000000)/population.set_index('ISO3')[str(year)]
	print(year_col)
	emissions_per_cap[year] = year_col
emissions_per_cap.to_csv('emissions_per_cap.csv')