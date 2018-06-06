import re
import json
import urllib.request
import sys
import time





# {"code":"9780679456278", "author":"Bill Maher", "x_note": "original upc"}
# {"code":"404308041756", "author":"Jerry Seinfeld", "x_note":"bookstore tag"}
# {"code":"03484706", "product":"ice cubes"}
# {"code":"074711748162", "product":"swingline"}
# {"code":"5410329220129", "product":"jumper wires ean"}
# {"code":"836479005662", "product":"jumper wires upc"}



def persist_to_file(file_name):

    def decorator(original_func):
        try:
            cache = json.load(open(file_name, 'r'))
        except (IOError, ValueError):
            cache = {}
            
        def new_func(param):
            if param not in cache:
                cache[param] = original_func(param)
                json.dump(cache, open(file_name, 'w'))

            return cache[param]
            
        return new_func
            
    return decorator


        
@persist_to_file('web.cache.dat')
def fetchUrl(url):
    ticks=time.time()
    print("rawfetch"+url)
    with urllib.request.urlopen(url) as response:
        html = response.read()
        print("     done "+str(time.time()-ticks))
        return str(html)


   
def firstHit(reg,orig):
    #print(str(orig))
        
    result=reg.search(orig)
    if not result:
        print("err0347"+orig[0:200])
        return None
    return result.group(1)

    

allDigits=re.compile(r'^\d+$')
sectionh1=re.compile(r'\<h1\>(.+)\<\/h1\>')
sectionh2=re.compile(r'\<h2\>(.+)\<\/h2\>')
def callGroc(code):
    
    stuff=fetchUrl("https://www.buycott.com/upc/"+code)
    
    counterCode=firstHit(sectionh1,stuff)
    if not counterCode or code not in counterCode:
        print("not found:"+code)
        return None
    
    prodName=firstHit(sectionh2,stuff)
    return prodName

    # <div id="container_header" class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
    #       <h1>EAN 03484706</h1>
    #                 <h2>Ice Breakers Ice Cubes Spearmint Gum Bottle Pack, 3 oz</h2>
    #                       </div>


abeExample="""  
<meta itemprop="isbn" content="9780679456278" />\n        <meta itemprop="name" content="Does Anybody Have a Problem with That?:: Politically Incorrect&#x27;s Greatest Hits" />\n        <meta itemprop="author" content="Maher, Bill" />\n   
"""
sectionAbeCode=re.compile(r'<meta itemprop="isbn" content="(\d+)" />')
sectionAbeProd=re.compile(r'<meta itemprop="name" content="([^"]+)" />')
sectionAbeAuthor=re.compile(r'<meta itemprop="author" content="([^"]+)" />')


    
def callBook(code):

    #stuff = fetchUrl("https://www.barcodelookup.com/"+code)  #9780679456278 #nope, JS test incapsula
    #stuff=fetchUrl("https://isbnsearch.org/isbn/"+code)
    stuff=fetchUrl("https://www.abebooks.com/servlet/SearchResults?sts=t&isbn="+code)

    counterCode=firstHit(sectionAbeCode,stuff)
    if not counterCode or code not in counterCode:
        print("not found:"+code)
        return None
    
    prodName=firstHit(sectionAbeProd,stuff)
    author =firstHit(sectionAbeAuthor,stuff)

    return (prodName,author)

    """ <meta itemprop="name" content="Does Anybody Have a Problem with That?:: Politically Incorrect&#x27;s Greatest Hits" />\n        <meta itemprop="author" content="Maher, Bill" />\n        <meta itemprop="about" content="Villard, 1996. Condition: Good. 1st Edition. Shows some signs of wear, and may have some markings on the inside. " />\n        <meta itemprop="publisher" content="Villard" />\n         <meta itemprop="datePublished" content="1996" />\n        <meta itemprop="bookEdition" content="1st Edition." />\n    \n  <div class="result-image col-xs-3 text-center">\n
    """
    print(stuff)
    sys.exit()
    #no work https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=9780679456278
    #would need beautiful soup  http://www.upcitemdb.com/upc/9780679456278
    #           stuff=fetchUrl("http://www.upcitemdb.com/upc/"+code)
    #stuff=fetchUrl("https://api.upcitemdb.com/prod/trial/lookup?upc="+code) #json but no author, too much other info
    #print(stuff)
    """
b'{"code":"OK","total":1,"offset":0,
"items":[{"ean":"9780679456278","title":"Does Anybody Have a Problem with That?:: Politically Incorrect\'s Greatest Hits","description":"","isbn":"9780679456278","publisher":"Villard Books","images":["https://pictures.abebooks.com/isbn/9780679456278-us.jpg","http://www.alibris.com/images/elements/no_image.gif","http://www0.alibris-static.com/isbn/9780679456278.gif","http://www.alibris.com/images/elements/no_image.gif","https://images.betterworldbooks.com/067/Does-Anybody-Have-a-Problem-with-That-Maher-Bill-9780679456278-md.jpg","http://dynamic.indigoimages.ca/books/9780679456278.jpg?width=200&maxheight=200"],"offers":[{"merchant":"Indigo Books & Music","domain":"chapters.indigo.ca","title":"Does Anyone Have a Problem with That?:  Politically Incorrect&\'s Greatest Hits","currency":"CAD","list_price":"","price":3.99,"shipping":"","condition":"New","availability":"","link":"http://www.upcitemdb.com/norob/alink/?id=v2w213030313a474&tid=3&seq=1520079673&plt=3e07a012950a76574424c72f9390acb9","updated_t":1441351426},{"merchant":"BetterWorld.com","domain":"betterworldbooks.com","title":"Does Anybody Have a Problem with That?:: Politically Incorrect\'s Greatest Hits","currency":"","list_price":"","price":3.46,"shipping":"","condition":"New","availability":"","link":"http://www.upcitemdb.com/norob/alink/?id=u2v233t2y2z2e444&tid=3&seq=1520079673&plt=a59ea0edd155d878da9835a58b8d2984","updated_t":1520006067},{"merchant":"Justice & Brothers","domain":"shopjustice.com","title":"Does Anybody Have a Problem with That?:: Politically Incorrect\'s Greatest Hits","currency":"","list_price":"","price":2.18,"shipping":"","condition":"New","availability":"","link":"http://www.upcitemdb.com/norob/alink/?id=z2p203w233137464&tid=3&seq=1520079673&plt=e22589a72c98259f0665b4529af8ec4a","updated_t":1413351290},{"merchant":"Alibris","domain":"alibris.com","title":"Does Anybody Have a Problem with That?:: Politically Incorrect\'s Greatest Hits","currency":"","list_price":"","price":0.99,"shipping":"","condition":"New","availability":"","link":"http://www.upcitemdb.com/norob/alink/?id=z2r223x2v2y28444&tid=3&seq=1520079673&plt=490d855cc6620625c23091f8d232dd85","updated_t":1426374705},{"merchant":"Alibris UK","domain":"alibris.co.uk","title":"Does Anybody Have a Problem with That?:: Politically Incorrect\'s Greatest Hits","currency":"GBP","list_price":"","price":5.85,"shipping":"","condition":"New","availability":"","link":"http://www.upcitemdb.com/norob/alink/?id=23s203v24363c494&tid=3&seq=1520079673&plt=5f05825200dba1c83af5281a98c5686e","updated_t":1413562338},{"merchant":"Abebooks","domain":"abebooks.com","title":"Does Anybody Have a Problem with That?:: Politically Incorrect\'s Greatest Hits","currency":"","list_price":"","price":26.47,"shipping":"","condition":"New","availability":"","link":"http://www.upcitemdb.com/norob/alink/?id=u2s2y2y22323e4d4u2&tid=3&seq=1520079673&plt=d5f1ba357b8fda3c23483051e31b1651","updated_t":1518383824}]}]}'
    """
    sys.exit()
    return "bookland--bugbug call amazon"+code


def lookUpInfo(code):
    if not allDigits.match(code):
        return "alpha--bugbug"
    
    if code.startswith("978"):
        return callBook(code)
    if len(code)==8:
        return callGroc(code)


    if len(code)==12:
        retval = callGroc(code)
        return retval
    if len(code)==13:
        return callGroc(code)
    
    return "unk--bugbug"+code






def test():

    fname="test1.tst"
    with open(fname) as f:
        content = f.readlines()
        for line in content:
            line = line.strip()
            if len(line)<2:
                continue

            jj=json.loads(line)
            if 'code' in jj:
                code=jj['code']

                if not code:
                    print("err0328")
                    sys.exit()

            result=lookUpInfo(code)
            print(code,result,line)
        else:
            print("bad line"+line)
            


#test()
def main():
    while 1:
        code=input("barcode?")
        result=lookUpInfo(code)
        print(result)

main()
        
