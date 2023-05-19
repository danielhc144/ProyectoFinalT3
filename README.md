# ProyectoFinalT3
Proyecto final de telecomunicaciones 3. 

Requisitos:
Virtual Box 6.1
Vagrant

Pasos de instalación:

## 1. Instalar 3 máquinas virtuales con el siguiente vagrantFile.

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

# 2. Configuración inicial de máquinas virtuales.

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

# 3. Instalación de httpd.

Para todas las maquinas: intalar httpd e iniciar servicio. 
```
sudo dnf install httpd 
sudo systemctl start httpd 
```
En la ubicación /var/www/html/ crear el archivo index.html y añadir: 
```
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
```
# 4. Instalación de mod_proxy_balancer. 

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
Copiar luego de "Include conf.modules.d/*.conf"

```
LoadModule proxy_balancer_module modules/mod_proxy_balancer.so 
LoadModule proxy_module modules/mod_proxy.so 
LoadModule proxy_http_module modules/mod_proxy_http.so 
```
Agregar el cluster en la configuración de httpd.
```
<Proxy balancer://mycluster> 

    BalancerMember http://192.168.60.4:80 

    BalancerMember http://192.168.60.2:80 
    #ProxySet lbmethod=bybusyness
    #ProxySet lbmethod=byrequests
    ProxySet lbmethod=bytraffic
</Proxy> 
```
Configurar el virtual host para utilizar el cluster añadiendo la siguiente configuración a httpd.conf: 
```
<VirtualHost *:80> 
    ServerName myserver.com
    ProxyPreserveHost On
    ProxyPass / balancer://mycluster/
    ProxyPassReverse / balancer://mycluster/
    DocumentRoot /var/www/html
    <Directory /var/www/html>
        AllowOverride All
        Require all granted
        DirectoryIndex main.html index.html
    </Directory>
</VirtualHost> 
```
Reiniciar Apache: 
```
sudo systemctl restart httpd 
```


# 5. Instalación de Artillery.

Realizar el siguiente procedimiento en servidorbalancer o en otra máquina externa.

Instalacion de Node Js 16:

Ejecutar las siguientes lineas:
```
sudo dnf update 
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash - 
sudo dnf install nodejs 
node -v 
```

Instalacion de npm 9.6.6:

Ejecutar las siguientes líneas:
```
sudo yum install npm 
npm install -g npm@latest 
npm -v 
```
 

Instalacion de Artillery 2.0.0-dev9: 

Ejecutar las siguientes líneas.
```
npm view artillery versions 
npm install -g artillery@2.0.0-dev9 
```

Ejecutar artillery: 

Crear un archivo archive.yml en este caso test.yml en una ruta definida, en este caso se puede usar:

```
cd /home/vagrant
```
En test.yml escribir el siguiente código de configuración de la prueba artillery, en este caso durante 20 segundos, se hacen 1000 solicitudes por segundo.
En target se encuentra la dirección del servidor balanceador.
```
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
```

Ejecutar archivo para prueba con artillery: 
```
artillery run test.yml 
```

Para más referencia:
 
https://access.redhat.com/documentation/en-us/jboss_enterprise_application_platform/6/html/administration_and_configuration_guide/install_the_mod_proxy_http_connector_into_apache_httpd 

 
