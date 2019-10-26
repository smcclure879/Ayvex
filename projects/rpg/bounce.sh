cp ../ngssl/localhost.* my_nginx.conf /usr/share/nginx
sleep 4s
nginx -s stop; nginx -c my_nginx.conf
