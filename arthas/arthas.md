# Arthas

### [文档地址](https://arthas.aliyun.com/doc/)

##### 下载

```
curl -O https://arthas.aliyun.com/arthas-boot.jar
java -jar arthas-boot.jar
```

##### 快速入门

1. 首先下载启动必要的

   ```sh
   #示例jar包
   curl -O https://arthas.aliyun.com/math-game.jar
   java -jar math-game.jar
   #启动arthas
   curl -O https://arthas.aliyun.com/arthas-boot.jar
   java -jar arthas-boot.jar
   ```

2. 选择java进程，按2然后回车即可

   ```sh
   $ $ java -jar arthas-boot.jar
   * [1]: 35542
     [2]: 71560 math-game.jar
   ```

   ![image-20221014160452525](http://qn.qs520.mobi/image-20221014160452525.png)

3. 输入`dashboard`然后回车就可以看到控制台

   ![image-20221014160652987](http://qn.qs520.mobi/image-20221014160652987.png) 

4. 然后使用`thread 1 |grep "main("`筛选出main方法的栈信息，获取到`math-game`进程的 Main Class

   ![image-20221014161042945](http://qn.qs520.mobi/image-20221014161042945.png) 

5. 通过`jad`反编译Main Class

   ![image-20221014161425954](http://qn.qs520.mobi/image-20221014161425954.png) 

6. 通过`watch`命令查看方法的返回值

   ![image-20221014161529487](http://qn.qs520.mobi/image-20221014161529487.png) 

7. 退出arthas

   ```
   退出当前链接：quit or exit
   完全退出：stop
   如果只是退出当前的连接，可以用quit或者exit命令。Attach 到目标进程上的 arthas 还会继续运行，端口会保持开放，下次连接时可以直接连接上。如果想完全退出 arthas，可以执行stop命令。
   ```

##### 使用浏览器访问

启动的时候通过`java -jar arthas-boot.jar --target-ip 0.0.0.0`来启动，然后在浏览器中访问`ip:8653` or `ip:3658`即可在浏览器访问，前提是需要开启对应端口以及下载telnet，unzip

![image-20221014162043451](http://qn.qs520.mobi/image-20221014162043451.png) 

#### 基础命令

###### help

* 查看命令帮助信息

例如：`help dashboard` 

![image-20221014163741122](http://qn.qs520.mobi/image-20221014163741122.png) 

###### base64

* 编码转换，和 linux 里的 base64 命令类似

![image-20221014164829986](http://qn.qs520.mobi/image-20221014164829986.png) 

###### quit

* 退出当前 Arthas 客户端，其他 Arthas 客户端不受影响

###### stop

* 关闭 Arthas 服务端，所有 Arthas 客户端全部退出

###### reset

* 重置增强类，将被 Arthas 增强过的类全部还原，Arthas 服务端关闭时会重置所有增强过的类

###### keymap

* Arthas 快捷键列表及自定义快捷键

###### session

* 查看当前会话的信息，显示当前绑定的 pid 以及会话 id。

  ```
   Name        Value                                                                                               
  --------------------------------------------------                                        
   JAVA_PID    16873                                                                                               
   SESSION_ID  1a0a5d76-a5bb-4bd5-9eed-64b7870062db   
  ```

###### version

* 输出当前目标 Java 进程所加载的 Arthas 版本号

##### 类似linux里的命令

###### cat

###### cls

###### echo

###### grep

###### history

###### pwd

###### tee

## JVM 相关

* [dashboard](https://arthas.aliyun.com/doc/dashboard.html) - 当前系统的实时数据面板
* [getstatic](https://arthas.aliyun.com/doc/getstatic.html) - 查看类的静态属性
* [heapdump](https://arthas.aliyun.com/doc/heapdump.html) - dump java heap, 类似 jmap 命令的 heap dump 功能
* [jvm](https://arthas.aliyun.com/doc/jvm.html) - 查看当前 JVM 的信息
* [logger](https://arthas.aliyun.com/doc/logger.html) - 查看和修改 logger
* [mbean](https://arthas.aliyun.com/doc/mbean.html) - 查看 Mbean 的信息
* [memory](https://arthas.aliyun.com/doc/memory.html) - 查看 JVM 的内存信息
* [ognl](https://arthas.aliyun.com/doc/ognl.html) - 执行 ognl 表达式
* [perfcounter](https://arthas.aliyun.com/doc/perfcounter.html) - 查看当前 JVM 的 Perf Counter 信息
* [sysenv](https://arthas.aliyun.com/doc/sysenv.html) - 查看 JVM 的环境变量
* [sysprop](https://arthas.aliyun.com/doc/sysprop.html) - 查看和修改 JVM 的系统属性
* [thread](https://arthas.aliyun.com/doc/thread.html) - 查看当前 JVM 的线程堆栈信息
* [vmoption](https://arthas.aliyun.com/doc/vmoption.html) - 查看和修改 JVM 里诊断相关的 option
* [vmtool](https://arthas.aliyun.com/doc/vmtool.html) - 从 jvm 里查询对象，执行 forceGc

## class/classloader 相关

* [classloader](https://arthas.aliyun.com/doc/classloader.html) - 查看 classloader 的继承树，urls，类加载信息，使用 classloader 去 getResource
* [dump](https://arthas.aliyun.com/doc/dump.html) - dump 已加载类的 byte code 到特定目录
* [jad](https://arthas.aliyun.com/doc/jad.html) - 反编译指定已加载类的源码
* [mc](https://arthas.aliyun.com/doc/mc.html) - 内存编译器，内存编译`.java`文件为`.class`文件
* [redefine](https://arthas.aliyun.com/doc/redefine.html) - 加载外部的`.class`文件，redefine 到 JVM 里
* [retransform](https://arthas.aliyun.com/doc/retransform.html) - 加载外部的`.class`文件，retransform 到 JVM 里
* [sc](https://arthas.aliyun.com/doc/sc.html) - 查看 JVM 已加载的类信息
* [sm](https://arthas.aliyun.com/doc/sm.html) - 查看已加载类的方法信息

## monitor/watch/trace 相关

* [monitor](https://arthas.aliyun.com/doc/monitor.html) - 方法执行监控
* [stack](https://arthas.aliyun.com/doc/stack.html) - 输出当前方法被调用的调用路径
* [trace](https://arthas.aliyun.com/doc/trace.html) - 方法内部调用路径，并输出方法路径上的每个节点上耗时
* [tt](https://arthas.aliyun.com/doc/tt.html) - 方法执行数据的时空隧道，记录下指定方法每次调用的入参和返回信息，并能对这些不同的时间下调用进行观测
* [watch](https://arthas.aliyun.com/doc/watch.html) - 方法执行数据观测

## profiler/火焰图

* [profiler](https://arthas.aliyun.com/doc/profiler.html) - 使用[async-profiler在新窗口打开](https://github.com/jvm-profiling-tools/async-profiler)对应用采样，生成火焰图
* [jfr](https://arthas.aliyun.com/doc/jfr.html) - 动态开启关闭 JFR 记录

## 鉴权

* [auth](https://arthas.aliyun.com/doc/auth.html) - 鉴权

## options

* [options](https://arthas.aliyun.com/doc/options.html) - 查看或设置 Arthas 全局开关

## 管道

Arthas 支持使用管道对上述命令的结果进行进一步的处理，如`sm java.lang.String * | grep 'index'`

* [grep](https://arthas.aliyun.com/doc/grep.html) - 搜索满足条件的结果
* plaintext - 将命令的结果去除 ANSI 颜色
* wc - 按行统计输出结果













































































