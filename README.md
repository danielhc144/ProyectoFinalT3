# ProyectoFinalT3
Proyecto final de telecomunicaciones 3. 

Requisitos:
Virtual Box 6.1
Vagrant

Pasos de instalación:

1. Instalar 3 máquinas virtuales con el siguiente vagrantFile.

```
# -- mode: ruby -- 

# vi: set ft=ruby : 

Vagrant.configure("2") do |config| 

  if Vagrant.has_plugin? "vagrant-vbguest" 

    config.vbguest.no_install  = true 

    config.vbguest.auto_update = false 

    config.vbguest.no_remote   = true 

  end 

  config.vm.define :servidorbalancer do |servidorbalancer| 

    servidorbalancer.vm.box = "generic/centos8" 

    servidorbalancer.vm.network :private_network, ip: "192.168.60.3" 

    servidorbalancer.vm.hostname = "servidorbalancer" 

  end 

  config.vm.define :servidor1 do |servidor1| 

    servidor1.vm.box = "generic/centos8" 

    servidor1.vm.network :private_network, ip: "192.168.60.4" 

    servidor1.vm.hostname = "servidor1" 

  end 

  config.vm.define :servidor2 do |servidor2| 

    servidor2.vm.box = "generic/centos8" 

    servidor2.vm.network :private_network, ip: "192.168.60.2" 

    servidor2.vm.hostname = "servidor2" 

  end 

End 
```

2. Configuración inicial de máquinas virtuales.

Realizando ssh a la máquina servidorbalancer, servidor1 y servidor2.

Desactivar selinux y firewalld. 

Para cada máquina virtual: ir a /etc/selinux/config y cambiar SELINUX.
```
SELINUX=disabled 
```

Reiniciar máquina virtual. 

Desactivar firewalld ingresando:

```
service firewalld stop
```
3. Instalación de mod_proxy_balance. 

Ejecutar en servidorbalancer:
```
sudo dnf install httpd httpd-tools mod_ssl 
```

Configurar el módulo para habilitar el módulo Proxy balancer:

Ir a la dirección de httpd.conf

```
sudo vim /etc/httpd/conf/httpd.conf 
```
Agregar las siguientes líneas para cargar el balanceador en la configuración:

```
LoadModule proxy_balancer_module modules/mod_proxy_balancer.so 
LoadModule proxy_module modules/mod_proxy.so 
LoadModule proxy_http_module modules/mod_proxy_http.so 
```

Agregar la configuración del balanceador de carga en el archivo de configuración de Apache 

sudo vim /etc/httpd/conf.d/proxy-balancer.conf 

Agregar el siguiente contenido: 

<Proxy balancer://mycluster> 

        BalancerMember http://10.0.0.1:80 

        BalancerMember http://10.0.0.2:80 

</Proxy> 

 

ProxyPass /test balancer://mycluster 

ProxyPassReverse /test balancer://mycluster 

 

En la siguiente ruta sudo vim /etc/httpd/conf/httpd.conf colocar lo siguiente: 

 

<Proxy balancer://mycluster> 

    BalancerMember http://192.168.60.4:80 

    BalancerMember http://192.168.60.2:80 

    ProxySet "lbmethod=bybusyness" 

    # Agrega tantos BalancerMember como servidores desees en tu cluster 

    # También puedes agregar opciones de balanceo, como por ejemplo "loadfactor" o "timeout" 

</Proxy> 

 

# Configura tu virtual host para utilizar el cluster 

<VirtualHost *:80> 

    ServerName myserver.com 

    ProxyPreserveHost On 

 

    ProxyPass / balancer://mycluster/ 

    ProxyPassReverse / balancer://mycluster/ 

 

#<Directory /var/www> 

#Options -Indexes 

#Order allow,deny 

#Allow from all 

#</Directory> 

</VirtualHost> 

 

Reiniciar Apache 

sudo systemctl restart httpd 

 

 

Para todas las maquinas: 

sudo dnf install httpd 

sudo systemctl start httpd 

En la ubicación /var/www/html/ crear el archivo index.html y añadir: 

<!DOCTYPE html> 

<html> 

<head> 

  <title>¡Hola, mundo!</title> 

</head> 

<body> 

  <h1>¡Hola, mundo!</h1> 

  <p>Este es un ejemplo de página web.</p> 

</body> 

</html> 

 

Artillery: 

Instalacion Node Js 16 

sudo dnf update 

curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash - 

sudo dnf install nodejs 

node -v 

 

Instalacion de npm 9.6.6 

sudo yum install npm 

npm install -g npm@latest 

npm -v 

 

Instalacion de Artillery: 2.0.0-dev9 

npm view artillery versions 

npm install -g artillery@2.0.0-dev9 

 

Ejecutar artillery: 

Crear archive.yml en este caso test.yml en una ruta definida, en este caso se puede usar /home/vagrant 

 

config: 

  target: "http://192.168.60.3" 

  phases: 

    - duration: 20 

      arrivalRate: 1000 

  defaults: 

    headers: 

      User-Agent: "Artillery" 

scenarios: 

  - name: "Test" 

    flow: 

      - get: 

          url: "/" 

Ejecutar: 

artillery run test.yml 

 
https://access.redhat.com/documentation/en-us/jboss_enterprise_application_platform/6/html/administration_and_configuration_guide/install_the_mod_proxy_http_connector_into_apache_httpd 

 
