from BeautifulSoup import BeautifulSoup, Tag

soup = open('cageList.html','w')

for yr in soup.findAll("span",{"class": "year_column"}):
    print yr.get_text()
    


