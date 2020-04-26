import pandas as pd 
import country_converter as coco
gain = pd.read_csv('gain.csv')

gain = gain.drop(columns=['Name'])
gain = gain.set_index(['ISO3'])
gain = gain.dropna(how='all')


gain.to_csv('gain_no_nans.csv')