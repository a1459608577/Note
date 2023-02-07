## 1. JWT无状态实现退出登录

描述：jwt本身是无状态的，只能设置过期时间，在过期时间这段时间中无法对jwt进行操作。

解决：把jwt生成的时候往redis中存一份，然后做校验的时候校验redis中的是否一致。或者退出登录的时候把jwt的secret改了，下次登录的时候生成的secret就不一致了，达到退出登录的效果。参考链接：[退出登录1](https://blog.csdn.net/weixin_42970433/article/details/103170301 )  [退出登录2](https://blog.csdn.net/weixin_42970433/article/details/102526722)

## 2.动态数据源循环依赖问题

## 3.security自定义授权模式，栈溢出问题

## 4. shell脚本中执行命令过滤问题

​	![image-20210831112913710](http://qn.qs520.mobi/image-20210831112913710.png)

## 5.SecurityContextHolder.getContext().getAuthentication()获取用户信息有时候为空

#### [原理解析](https://blog.csdn.net/yanyundi/article/details/111984303)

首先是在rabbitmq的监听器中新增订单数据失败，然后发现是mybatis-plus自动填充属性获取当前用户为null，(`SecurityContextHolder.getContext().getAuthentication()`获取不到用户登录信息),.然后就想通过`((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getResponse()`去获取request中的token信息，然后获取不到，[原因](https://blog.csdn.net/zzy7075/article/details/53559902/）是从threadLocal中获取的，但是rabbitmq监听到消息这个线程是获取不到request的，只能在主线程中获取

## 6.Feign远程调用鉴权失败

原因是feign远程调用会重新构造一个request对象导致请求头信息丢失，解决方法只需要创建一个feign的拦截器，在里面设置请求头信息即可

```java
@Component
public class FeignInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate requestTemplate) {
        HttpServletRequest request = WebUtils.getRequest();
        if (request != null) {
            String header = request.getHeader("Authorization");
            requestTemplate.header("Authorization", header);
        }
    }
}
```

## 7.Springboot + Seata出现的问题

1. #### 控制台一直输出nacos的心跳日志

   解决方案：

   1. 去除配置文件中的`namespace：public`配置，如果是public则不需要配置

   2. 调整nacos依赖的version，改成2.1.0

      ```xml
      <dependency>
          <groupId>com.alibaba.cloud</groupId>
          <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
          <version>2.1.0.RELEASE</version>
      </dependency>
      <!--服务的配置中心依赖-->
      <dependency>
          <groupId>com.alibaba.cloud</groupId>
          <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
          <version>2.1.0.RELEASE</version>
      </dependency>
      ```

2. #### 在控制台一直输出找不到合适的默认的服务no available service 'default' found, please make sure registry config correct

   [参考链接](https://blog.csdn.net/w1054993544/article/details/107793501)

   查看源码发现seata从nacos上拉取配置的时候，源码中写死了seata服务名和默认的group，两者分别为serverAddr和DEFAULT_GROUP，然后在registry.conf文件中配置的application为seata-server和SEATA_GROUP，所以找不到相应的配置就报错了。

   ​	解决方案：修改registry.conf的application和group即可==（另外: 在application.yml中配置这两项似乎不管用）==，如图：

   ​		![image-20211001162803886](http://qn.qs520.mobi/image-20211001162803886.png) 

   ​		![image-20211001162554789](http://qn.qs520.mobi/image-20211001162554789.png) 

   

## 8.Easy Excel导出文件在本地生效，在linux上以及Docker容器中失效

* 原因: 在linux和Docker上没有字体

* 解决方案：

  * linux:

    ```
    安装字体包：yum -y install fontconfig
    
    刷新内存中的字体缓存：fc-cache	
    
    查看字体是否安装成功(有一种即可)：fc-list 
    
    重启项目（不必重启服务器）
    ```

  * Docker:

    ```
    在Dockfile中添加
    RUN apk add --update font-adobe-100dpi ttf-dejavu fontconfig
    ```

## 9. 线程池中使用InheritableThreadLocal导致的问题

[参考链接](https://www.cnblogs.com/sweetchildomine/p/6575666.html)	

首先ThreadLocal和InheritableThreadLocal的区别就是，前者不能在子线程中使用，在子线程中获取不到threadLocalMap中的数据，使用后者则可以。因为后者是前者的子类，重写了前者的几个方法如下：

```java
public class InheritableThreadLocal<T> extends ThreadLocal<T> {

    protected T childValue(T parentValue) {
        return parentValue;
    }

    ThreadLocalMap getMap(Thread t) {
       return t.inheritableThreadLocals;
    }

    void createMap(Thread t, T firstValue) {
        t.inheritableThreadLocals = new ThreadLocalMap(this, firstValue);
    }
```

重点是在Thread类中，Thread的构造方法调用init()方法，而init()方法中会判断父线程的inheritableThreadLocals是否为空，不为空就复制一份放到子线程的inheritableThreadLocals中，就完成了在子线程也可以访问父线程的threadLocalMap，实际是复制了一份。

![image-20220120163338992](http://qn.qs520.mobi/image-20220120163338992.png) 

在线程池中不可用的原因是因为线程池的复用机制，线程池中线程创建的时候就会复制父线程的inheritableThreadLocals，假设线程池长度为2，此时创建两个线程交给线程池提交执行，这两个线程主要是输出threadLocal的值，然后在创建一个线程修改threadLocals的值并交给线程池执行，把这个操作放到while循环中多执行几次会发现，之前的t1，t2线程中可能会出现修改后的值。是因为线程池回收掉一个线程后，留下的两个线程中有一个是修改后的线程，因为线程的复用，所以执行方法的线程是修改后的，就会输出修改后的值。

## 10.排查服务器rabbitmq cpu飙高

背景是rabbitmq出现消息堆积，然后上服务器查看rabbitmq是否启动，顺便查看下cpu使用率发现的。首先使用自带的`rabbitmq-plugins list`命令查看所有插件及开启情况，然后使用命令`rabbitmq-plugins enable rabbitmq_top`开启插件，这样就能在控制台看到rabbitmq的内存和cpu使用情况了。通过`top -H -p PID`命令查看 beam.smp 进程里的每个线程的 CPU 使用情况，发现主要是有两个调度器在占用cpu，通过命令`rabbitmq-diagnostics runtime_thread_stats`查看线程的运行状况，发现两个调度器的 sleep 时间在 99 % ，也就是说调度器大部分时间是空闲的。在官方文档中有一节讲到了 CPU 相关的内容：https://www.rabbitmq.com/runtime.html#cpu。里面提到了调度器在从 sleep 状态转换成工作状态是需要一定的成本的，因此在调度器没有任务调度时默认会延迟一段时间才进入 sleep 状态，调度器的忙等待是会占用 CPU的。因此我们可以通过禁用忙等待来降低 CPU 的消耗:

* `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+sbwt none +sbwtdcpu none +sbwtdio none"`

这条配置需要添加到文件` /etc/rabbitmq/rabbitmq-env.conf` 中，如果没有则创建该文件。文档上还给出了，在共享或CPU受限的环境（包括容器化的环境）中，可能需要显式配置调度程序个数。我们也可以通过改变调度器个数来降低 CPU 的消耗：

* `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+S 1:1"`

上面的两种方式的修改经过压测都可以有效的降低 CPU 的占用，效果上相差不大，在多核 CPU 的情况下多个调度器可能 CPU 的利用率更高。在实际的应用中要根据实际情况选择。

## 11.排查Java内存或cpu使用率过高

[参考链接](https://www.jianshu.com/p/5bfa10885a20)

上服务器的时候发现内存不足，cpu飙高了，首先使用`free -m`查看内存使用情况 ，total是总内存，used是占用内存，free是真正可用内存，buffer/catch是缓存内存。然后使用`top`命令再按m根据占用内存进行排序查看进程。也可以用`htop`不过不是自带的，能看到更多信息。然后使用`top -p pid -H`查看某个进程的具体占用情况，记下cpu使用率过高进程的pid。然后通`jstack pid > xxx.log`把堆栈信息输出到日志中。然后再输出的日志文件中查找这些pid。发现对应的是GC线程，可能是内存不足导致频繁gc。再使用`jstat -gc pid`查看jvm的gc情况。发现FGC(这个是full gc的次数)数值变化较快。刚开始看到内存占用过高就需要用`jmap -histo:live pid > xxx.log`分析下jvm内存存活对象统计情况。然后发现有一个业务对象占用的比较多，在代码里面排查是数据库查询的时候查出来的数据太大，导致内存中这个对象占用过多。后面先把jvm堆内存加大并且把代码中的逻辑进行修改。最终解决了这个问题。问题定位从刚开始发现内存不足导致频繁gc从而使cpu使用率飙升。







































