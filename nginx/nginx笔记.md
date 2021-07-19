#Nginx
###
## 1.在linux上安装nginx
###1. 先建立远程连接
###2. 然后去官网下载包和依赖(pcre，openssl，zlib，nginx)
1. pcre：
	* 把压缩文件放到linux然后解压： **tar -zxvf pcre**
	* 进入解压后的文件输入**./configure(这是要配置文件)**
	* 然后使用命令: **make && make install(表示编译和安装)**
	* 查看版本号： **pcre-config --version**
* 安装openssl和zlib
	* **yum -y install make zlib zlib-devel gcc-c++ libtool openssl openssl-devel**
* 安装nginx
	* 把压缩文件放到linux下/usr/src然后解压： **tar -zxvf nginx**
	* 进入解压后的文件输入**./configure(这是要配置文件)**
	* 然后使用命令: **make && make install(表示编译和安装)**
	* nginx启动报错： error while loading shared libraries: libpcre.so.1: cannot open shared object file: No such file or directory
		* 解决方法  

				[root@lee ~]#  ln -s /usr/local/lib/libpcre.so.1 /lib64  
				[root@lee ~]# /usr/local/nginx/sbin/nginx   //启动命令
	* 查看所有的端口号： **netstat -ntlp**(centos6.5版本)
	* 设置开放的端口号： 
		* **/sbin/iptables -I INPUT -p tcp --dport 端口号 -j ACCEPT   写入修改**
		* **/etc/init.d/iptables save   保存修改**
		* **service iptables restart    重启防火墙，修改生效**
### 3.nginx常用命令(前提是必须进入nginx的目录下也就是/usr/local/nginx/sbin)
1. 查看版本号： **./nginx -v**
2. 启动nginx： **./nginx**
3. 关闭nginx： **./nginx -s stop**
4. 重新加载nginx： **./nginx -s reload**
	* 遇到报错： nginx: [error] open() "/usr/local/nginx/logs/nginx.pid" failed (2: No such file or directory)
	* 解决方法： **/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf**
	* 遇到报错： nginx: [emerg] still could not bind(),这是端口被占用问题 
	* 解决方法： **netstat -tnlp | grep 80**，查看80端口被谁占用然后在进行调整
###4.nginx的配置文件
* 路径： **/usr/local/nginx/conf/nginx.conf**
* 由三部分组成
	* 第一部分： **全局块**
	* ![](./img/1.png)
	* 第二部分： **events块**
	* ![](./img/2.png)
	* 第三部分： **http块**
	* ![](./img/3.png)
## 2.nginx的配置实例一(反向代理一)
### 1.要实现的效果： 
* 在windows中浏览器输入www.123.com要跳转到linux系统中tomcat页面
### 2.安装jdk
* 先把jdk的安装包放到/usr/src下然后解压
* 然后在**vim /etc/profile**下配置环境变量,加到文件的最后

		export JAVA_HOME=/usr/local/jdk/jdk1.8.0_181
		export CLASSPATH=$:CLASSPATH:$JAVA_HOME/lib/ 
		export PATH=$PATH:$JAVA_HOME/bin
* 然后重新加载一些配置文件： **source /etc/profile**,最后输入**java -version**查看版本号
* 补充：

		update-alternatives --config java   //这两个是切换java的jdk版本的
		update-alternatives --config javac
		yum install -y java-1.8.0-openjdk-devel.x86_64   //这条命令是一键安装jdk1.8

### 3.准备工作
* 在linux中安装tomcat，默认端口8080，解压然后启动 
* 对外开放访问端口8080
### 4.访问过程的分析
* ![](./img/4.png)
### 5.具体配置
1. 在windows的host文件中配置域名 和IP的对应关系
	* ![](./img/5.png)
2. 在文件中添加内容，通过在浏览器中输入http://www.123.com:8080/可以验证是否配置好了
	* ![](./img/6.png)
### 6.在nginx中配置请求转发(反向代理配置)
* ![](./img/7.png)
### 7.最终测试
* 打开nginx，然后在windows中浏览器输入www.123.com
* ![](./img/8.png)
## 3.nginx的配置实例二(反向代理二)
###1.实现效果
* ![](./img/9.png)
###2.准备工作
1. 准备两个tomcat，一个8080端口，一个8081端口
2. 准备文件夹和测试页面 
###3.具体配置
1. 找到nginx配置文件，进行反向代理
2. ![](./img/10.png)
3. 开放9001，8081端口号
* ![](./img/11.png)
* ![](./img/12.png)
***
* ![](./img/13.png)
## 4.nginx的配置实例三(负载均衡)
###负载均衡的概念
* ![](./img/14.png)
###1.实现效果
* ![](./img/15.png)
###2.准备工作
* 准备两个tomcat，一个8080端口，一个8081端口，在webapps里面创建edu目录在里面创建a.html,但是内容不同
###3.在nginx配置文件中配置
* ![](./img/16.png)
###4.nginx分配服务器的策略
* 第一种： **轮询**(默认)
	* 每个请求按时间顺序注意分配到不同的后端服务器，如果后端服务器down掉可以自动剔除
* 第二种： **weight(权重)**
	* weight代表权重，权重值越高，分配的服务器越多，默认为1
* 第三种： **ip_hash**
	* 每个请求按照访问ip的hash结果分配，这样每个访客固定访问一个服务器，例如 刚开始访问的8080，后面就一直访问8080
	* ![](./img/17.png)
* 第四种： **fair(第三方)**
	* 按照服务器的相应时间来分配请求，响应时间短的优先分配
	* ![](./img/18.png)
## 5.nginx的配置实例四(动静分离)
###1.概念
* ![](./img/20.png)
* ![](./img/19.png)
###2.准备工作
* 在linux中放一些静态资源用于访问
###3.在nginx配置文件中配置
* ![](./img/22.png)
###4.最终测试
* 在浏览器中输入**http://192.168.6.133/img/01.jpg**可以直接访问到
## 6.nginx配置高可用的集群
###1.高可用的概念
* ![](./img/23.png)
###2.配置高可用的准备工作
* 两台服务器： 192.168.6.133和192.168.6.131
* 在两台服务器上安装nginx和keepalived
	* 用yum命令安装keepalived： **yum install keepalived -y**
	* 安装好后路径在： **/etc/keepalived下**
		* ![](./img/21.png)
		* 解决方案： **rm -f /var/run/yum.pid**
	* keepalived的配置文件路径： **/etc/keepalived/keepalived.conf**
###3.完成高可用的配置(主从配置)
* 修改/etc/keeoalived下的keepalived.conf文件

		global_defs {
		 notification_email {
			 acassen@firewall.loc
			 failover@firewall.loc
			 sysadmin@firewall.loc
		 }
		 notification_email_from Alexandre.Cassen@firewall.loc
			 smtp_server 192.168.6.133
			 smtp_connect_timeout 30
			 router_id LVS_DEVEL
		 }
		 vrrp_script chk_http_port {
			 script "/usr/local/src/nginx_check.sh"
			 interval 2 #（检测脚本执行的间隔）
			 weight 2
		 }
		 vrrp_instance VI_1 {
			 state MASTER # 备份服务器上将 MASTER 改为 BACKUP 
			 interface eth0 //网卡
			 virtual_router_id 51 # 主、备机的 virtual_router_id 必须相同
			 priority 100 # 主、备机取不同的优先级，主机值较大，备份机值较小
			 advert_int 1
			 authentication {
			 auth_type PASS
			 auth_pass 1111
		 }
		 virtual_ipaddress {
		 	192.168.17.50 // VRRP H 虚拟地址
		 } 
		}
* 在/usr/local/src下添加一个检测脚本

		#!/bin/bash
		A=`ps -C nginx –no-header |wc -l`
		if [ $A -eq 0 ];then
		    /usr/local/nginx/sbin/nginx
		    sleep 2
		    if [ `ps -C nginx --no-header |wc -l` -eq 0 ];then
		        killall keepalived
		    fi
		fi
* 启动nginx和keepalived
	* 启动keepalived： **service keepalived start**
* 然后输入**ip a**查看虚拟ip
	* ![](./img/24.png)
* 然后把主服务器停了了，还是可以访问
## 6.nginx的原理分析
* ![](./img/26.png)
* ![](./img/27.png)
* ![](./img/28.png)
* ![](./img/29.png)
* ![](./img/30.png)














