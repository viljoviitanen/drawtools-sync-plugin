source = source-draw-tools-sync.user.js
distname = draw-tools-sync.user.js
server = drawtools-sync.appspot.com
url = https:\/\/viljoviitanen.nfshost.com\/iitc\/draw-tools-sync.user.js
all:
	@echo "make local|net"
local:
	sed -e 's/XXSERVERXX/http:\/\/0.0.0.0:8080/' -e s/XXURLXX/local/ -e s/XXVERSIONXX/`date +%Y%m%d.%H%M%S.local`/ < $(source) > $(distname)
net:
	sed -e "s/XXSERVERXX/https:\/\/$(server)/" -e "s/XXURLXX/$(url)/" -e s/XXVERSIONXX/`date +%Y%m%d.%H%M%S.$(server)`/ < $(source) > $(distname)
