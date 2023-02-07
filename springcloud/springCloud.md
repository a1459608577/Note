#SpringCloud笔记
---

## SpringCloud升级,部分组件停用:

1, Eureka停用,可以使用zk作为服务注册中心

2, 服务调用,Ribbon准备停更,代替为LoadBalance

3, Feign改为OpenFeign

4, Hystrix停更,改为resilence4j 或者阿里巴巴的sentienl

5, Zuul改为gateway

6, 服务配置Config改为  Nacos

7, 服务总线Bus改为Nacos

##环境搭建
### yml文件配置

	server:
	  port: 8001 #端口号
	
	spring:
	  application:
	    name: cloud-payment-service # 服务名称
	  datasource:
	    type: com.alibaba.druid.pool.DruidDataSource
	    url: jdbc:mysql://localhost:3306/guigu?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=GMT%2B8
	    password: root
	    username: root
	    driver-class-name: com.mysql.cj.jdbc.Driver
	
	mybatis:
	  mapper-locations: classpath:mapper/*.xml
	  type-aliases-package: com.hnguigu.domain # 实体类所在包名， 会用包名简单映射
###新建主启动类就可以开始写代码了

	@SpringBootApplication
	public class PayMentMain {
	
	    public static void main(String[] args) {
	        SpringApplication.run(PayMentMain.class, args);
	    }
	}


###使用restTemplate进行远程调用
####1.导入spring相关依赖，
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
####2. 建立一个配置类

	@Configuration
	public class ApplicattionContextConfig {
	
	    @Bean
	    public RestTemplate getRestTemplate() {
	        return new RestTemplate();
	    }
	}
####3. 调用
    public static final String URL = "http://localhost:8001";

    @Resource
    private RestTemplate restTemplate;

    @GetMapping("/payment/add")
    public CommonReault<Payment> add(Payment payment) {
        // 三个参数分别是， 要远程调用的url地址， 第二个是参数， 第三个是返回值类型
        return restTemplate.postForObject(URL + "/payment/payment", payment, CommonReault.class);
    }
##2. 服务注册与发现
###1. Eureka
##### Eureka是什么： 它是一个基于REST的服务，有服务发现注册功能，就可以通过服务标识符访问服务，底层是 使用http client进行RPC远程调用(有待补充)
##### 能干嘛： 
* Registe服务注册
* Renew服务续约
* Fetch Registries获取注册列表信息
* Cancel服务下线
* Eviction服务剔除
* **总的来说就是服务注册把微服务注册到eureka的注册中心，然后会建立一个心跳连接，每间隔三十秒发送一次心跳，如果超过九十秒没有发送心跳，注册中心就会把这个微服务剔除， eurekaclient从eurekaserver获取服务注册表信息，将其缓存在jvm中(用到了Ribbon)，然后进行远程连接，每隔30秒刷新一次，若由于某种原因导致注册表信息不能即使匹配，会重新获取整个注册表的信息，他们之间可以通过json或xml传输，一般是用的json，这个就是获取注册表信息，当eirekaclient在程序关闭时可以向server端发送下线请求，发送请求后将从注册中心将其删除，需要手动发请求**
> DiscoveryManager. getinstance() .shutdownComponent(); 
* ![](http://qn.qs520.mobi/931fa1405f072059958e2fd805a848dc.png)
###单机版Eureka
##### 创建项目cloud-eureka-server7001
* 改pom

		<dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>
* 步骤还是和之前一样，，写yml， 建启动类有点不一样，要加一个注解
* ![](http://qn.qs520.mobi/8dcd27f233860931a32b83dfaf914006.png)
#####修改cloud-payment8001项目
* 先添加pom
			
		<dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
* 然后在启动类上添加**@EnableEurekaClient**注解，**表示吧这个注册进eureka成为服务提供者**
* 然后修改yml文件， 添加如下配置

		eureka:
		  client:
		    register-with-eureka: true # 表示是否将自己默认注册进eureka， 默认为true
		    fetch-registry: true # 是否从eureka抓取已有的注册信息， 默认为true，单节点无所谓，集群必须设置成true才配合ribbon负载均衡
		    service-url:
		      defaultZone: http://localhost:7001/eureka  #表示这个要去那个地址注册
* 步骤还是和之前一样，，写yml， 建启动类有点不一样，要加一个注解
* 先启动eureka注册中心启动类，然后把刚这个启动，在eureka监控页面就能看到
* ![](http://qn.qs520.mobi/faaa67d9abfb6f77707cd404b0e7d141.png)
####然后把order80项目按照上面的样子修改，然后启动，结果如下
* ![](http://qn.qs520.mobi/20434d097749d26b52c397d917b18734.png)
* ![](http://qn.qs520.mobi/01ec660059ba1b8bd222745f284b8ec8.png)
###集群Eureka(高可用)
* ![](http://qn.qs520.mobi/6da71f094a1d0edbe5018591cda4f9f9.png)
####集群Eureka原理说明：互相注册，相互守望
* 按照搭建项目的样子创建项目cloud-eureka-server7002，pom跟启动类都跟cloud-eureka-server7001一样，配置文件有点不同
* **eureka7002.com**是因为两台机器不能都用localhost，需要在**C:\Windows\System32\drivers\etc**下修改host文件吧端口映射一下

> 127.0.0.1  eureka7001.com
> 
> 127.0.0.1  eureka7002.com
		
		server:
		  port: 7002
		
		eureka:
		  instance:
		    hostname: eureka7002.com #服务端的实例名称
		  client:
		    register-with-eureka: false  # false表示注册中心不能自己注册自己，
		    fetch-registry: false # 表示本端就是注册中心，不用检索服务
		    service-url:
		      # 设置eureka server交互的地址， 查询服务和注册服务都要依赖这个地址
		      defaultZone: http://eureka7001.com:7001/eureka/
* 然后启动两个启动类
* 然后修改8001和80项目的yml
		
		改这个地方就可以了
		service-url:
	      #defaultZone: http://localhost:7001/eureka 单机版
	      defaultZone: http://eureka7001.com:7001/eureka,http://eureka7002.com:7002/eureka # 集群版
* ![](http://qn.qs520.mobi/442963b385eba1b32be5eed2b70a4422.png)
###支付服务提供者8001集群环境搭建
* ![](http://qn.qs520.mobi/685d79e88cb08a7024349ca28d6a2592.png)
* 然后使用消费者访问端口不能写死
> public static final String URL = "http://CLOUD-PAYMENT-SERVICE";

* ![](http://qn.qs520.mobi/f38373959483ab2e0c8c5578c27df0e9.png)
* 使用**@LoadBalanced**注解让消费者实现负载均衡，在8001,8002两个端口中切换
* ![](http://qn.qs520.mobi/f24dcfe9983675bceeba140cbd86b8a5.png)
* 修改在eureka注册信息表中的服务名称和访问信息有ip信息提示
	* 只需要在yml文件中的eureka中添加如下配置

			instance:
			    instance-id: payment8001
			    prefer-ip-address: true
###Eureka的自我保护
* ![](http://qn.qs520.mobi/7efcbca8ae9e92373f9cafa45c5db357.png)
####原因：
* 某个时候某一个微服务不能用了不会被立即删除，依旧会对他进行保存**属于CAP中的AP分支**
* ![](http://qn.qs520.mobi/130a1f54d642e29353a98b45d5a3601c.png)
####禁用自我保护机制
* 先把7001和8001变成单机版，然后修改yml配置，然后关闭8001的服务，会发现立即被删除了，之前是不会立即删除的
* ![](http://qn.qs520.mobi/888acb8fc8ba33d330202083b09ea262.png)
###2. Zookeeper作为注册中心
####还是建工程，改pom， 写yml
* pom文件的差别

		<!--SpringBoot整合Zookeeper客户端-->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
            <exclusions>
                <!--先排除自带的zookeeper3.5.3， 不然会报错，要跟linux上安装的zookeeper版本一致-->
                <exclusion>
                    <groupId>org.apache.zookeeper</groupId>
                    <artifactId>zookeeper</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <!--添加zookeeper3.4.14版本-->
        <dependency>
            <groupId>org.apache.zookeeper</groupId>
            <artifactId>zookeeper</artifactId>
            <version>3.4.14</version>
        </dependency>
####改yml
	
	server:
	  port: 8004  # 表示注册到zookeeper服务器的支付提供者的端口号
	spring:
	  application:
	    name: cloud-zookeeper-payment  # 表示注册到zookeeper的服务名
	  cloud:
	    zookeeper:
	      connect-string: 192.168.43.79:2181 # linux的ip地址，加zookeeper的端口号
####启动类

	@SpringBootApplication
	@EnableDiscoveryClient //该注解作用于consul或zookeeper作为注册中心时的注册服务
	public class PayMentMain8004 {
	
	    public static void main(String[] args) {
	        SpringApplication.run(PayMentMain8004.class, args);
	    }
	}
####controller业务类

	@RestController
	@RequestMapping("/payment")
	@Slf4j
	public class PamentController {
	
	    @Value("${server.port}")
	    private String port;
	
	    @GetMapping("/payment/zk")
	    public String paymentzk() {
	        return "springcloud with zookeeper" + port  + "**     " + UUID.randomUUID().toString();
	    }
	}
###3. Consul
###介绍
* ![](http://qn.qs520.mobi/571a571b674d04b65581a3e875c03daf.png)
* ![](http://qn.qs520.mobi/a09e83fdbd8abc2feff23866cd287257.png)
###创建项目
####1. 改pom，新增如下pom依赖就可

    <!--SpringCloud consul-server-->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-consul-discovery</artifactId>
    </dependency>
####2. 写yml

	server:
	  port: 80
	
	spring:
	  application:
	    name: cloud-consumer-order
	
	  # consul注册中心
	  cloud:
	    consul:
	      host: localhost
	      port: 8500
	      discovery:
	        service-name: ${spring.application.name}
	      #hostname: 127.0.0.1
####3. 其他还跟之前一样
###三个注册中心的异同
* ![](http://qn.qs520.mobi/693a352508ae5525006b016d10f34430.png)
* ![](http://qn.qs520.mobi/1e8be7179adb8ecb6b3c85aaa14a7c26.png)
* ![](http://qn.qs520.mobi/cae0cdfc472c34008756269efa15c7b2.png)
##3. Ribbon负载均衡服务调用
###简介
####是什么
* Ribbon是通过restTemplate实现提供给客户端做负载均衡的，有五种的方式**(轮询， 哈希， 随机， 权重， 自定义)**
* Ribbon是Netflix发布的开源项目，主要功能是提供客户端的软件负载均衡算法，将Netflix的中间层服务连接在一起。Ribbon客户端组件提供一系列完善的配置项如连接超时，重试等。简单的说，就是在配置文件中列出Load Balancer（简称LB）后面所有的机器，Ribbon会自动的帮助你基于某种规则（如简单轮询，随即连接等）去连接这些机器。我们也很容易使用Ribbon实现自定义的负载均衡算法。
####LB方案分类
* 目前主流的LB方案可分成两类：一种是**集中式LB**, 即在服务的消费方和提供方之间使用独立的LB设施(可以是硬件，如F5, 也可以是软件，如nginx), 由该设施负责把访问请求通过某种策略转发至服务的提供方；另一种是**进程内LB**，将LB逻辑集成到消费方，消费方从服务注册中心获知有哪些地址可用，然后自己再从这些地址中选择出一个合适的服务器。Ribbon就属于后者，它只是一个类库，集成于消费方进程，消费方通过它来获取到服务提供方的地址
* ![](http://qn.qs520.mobi/c0b404f3f6f060ec8c0dd028d89c834e.png)
###Ribbon负载均衡演示
* ![](http://qn.qs520.mobi/13d70a04500928f65dab4f7b9634d51c.png)

	    //使用getEntry
	    @GetMapping("/payment/getEntity/{id}")
	    public CommonReault<Payment> queryById1(@PathVariable Integer id) {
	        ResponseEntity<CommonReault> entity = restTemplate.getForEntity(URL + "/payment/payment/" + id, CommonReault.class);
	        if (entity.getStatusCode().is2xxSuccessful()) {
	            return entity.getBody();
	        } else {
	            return new CommonReault(444, "失败");
	        }
	    }
###Ribbon核心组件IRule
* ![](http://qn.qs520.mobi/a47c121c5096899157a5971a862900d4.png)
####如何替换
* ![](http://qn.qs520.mobi/c1da0982f845b8eb97a7c28ffd0a4ab9.png)
###Ribbon负载均衡算法
####原理
* ![](http://qn.qs520.mobi/54516331e7cadd5847b796ee0c4c1fa0.png)
* ![](http://qn.qs520.mobi/30573e59073a0dca6c16b6f266d92e0f.png)
* **就是RestTemplate发起一个请求，这个请求被LoadBalancerInterceptor给拦截了，拦截后将请求的地址中的服务逻辑名转为具体的服务地址，然后继续执行请求，就是这么一个过程。**
####源码

	
    private AtomicInteger nextServerCyclicCounter; //原子整形类
    private static final boolean AVAILABLE_ONLY_SERVERS = true;
    private static final boolean ALL_SERVERS = false;

	public Server choose(ILoadBalancer lb, Object key) {
		// 没有负载均衡规则直接报错
        if (lb == null) {
            log.warn("no load balancer");
            return null;
        }

        Server server = null;
        int count = 0;
        while (server == null && count++ < 10) {
            List<Server> reachableServers = lb.getReachableServers();  //把活着的健康的机器选出来
            List<Server> allServers = lb.getAllServers(); //拿到所有的机器
            int upCount = reachableServers.size();
            int serverCount = allServers.size();

            if ((upCount == 0) || (serverCount == 0)) {
                log.warn("No up servers available from load balancer: " + lb);
                return null;
            }

            int nextServerIndex = incrementAndGetModulo(serverCount);
            server = allServers.get(nextServerIndex);

            if (server == null) {
                /* Transient. */
                Thread.yield();
                continue;
            }

            if (server.isAlive() && (server.isReadyToServe())) {
                return (server);
            }

            // Next.
            server = null;
        }

        if (count >= 10) {
            log.warn("No available alive servers after 10 tries from load balancer: "
                    + lb);
        }
        return server;
    }

    /**
     * Inspired by the implementation of {@link AtomicInteger#incrementAndGet()}.
     *
     * @param modulo The modulo to bound the value of the counter.
     * @return The next value.
     */
    private int incrementAndGetModulo(int modulo) {
		//自旋锁
        for (;;) {
            int current = nextServerCyclicCounter.get();
            int next = (current + 1) % modulo;
            if (nextServerCyclicCounter.compareAndSet(current, next)) //比较并设值
                return next;
        }
    }
* 用了JUC(CAS和自旋锁的复习)
####手写
##4. OpenFeign服务接口调用
###简介
####是什么
* Feign是一个声明式的Web Service客户端。它的出现使开发Web Service客户端变得很简单。使用Feign只需要创建一个接口加上对应的注解，比如：@FeignClient注解。
####能干嘛
* ![](http://qn.qs520.mobi/1d67c53a1a6b5083b352885a3810ab90.png)
####Feign跟OpenFeign的区别
* ![](http://qn.qs520.mobi/b62ea4a95ed762bf623ef1a885ba515f.png)
###使用步骤
####1. 接口加注解： 微服务调用接口 + @FeignClient
####2. 新建cloud-consumer-feign-order80项目： Feign在消费端使用
####3. pom
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
        <version>2.2.1.RELEASE</version>
    </dependency>
####4. yml
	server:
	  port: 80
	
	eureka:
	  client:
	    register-with-eureka: false
	    service-url: http://eureka7001.com:7001/eureka/,http://eureka7002.com:7002/eureka/
####5. 启动类
	@SpringBootApplication
	@EnableFeignClients //表示使用Feign，激活Feign
	public class OrderFeignMain80 {
	
	    public static void main(String[] args) {
	        SpringApplication.run(OrderFeignMain80.class, args);
	    }
	}
####6.业务类
* 业务逻辑接口 + @FeignClient配置调用orivider服务
* 新建PaymentFeignService接口并添加**@FeignClient**注解
 
		@FeignClient("CLOUD-PAYMENT-SERVICE") //表示要访问哪个服务
		@Component
		public interface PaymentFeignService {
		
		    @GetMapping("/payment/payment/{id}")
		    public CommonReault<Payment> queryById(@PathVariable("id") Integer id);
		}
* 控制层controller

		@RestController
		@RequestMapping("/consumer")
		@Slf4j
		public class OrderFeignController {
		
		    @Autowired
		    private PaymentFeignService paymentFeignService;
		
		    @GetMapping("/order/{id}")
		    public CommonReault<Payment> getById(@PathVariable Integer id) {
		        return  paymentFeignService.queryById(id);
		    }
		}
* ![](http://qn.qs520.mobi/7d4bf96e9d1950c602b27d273282080f.png)
####7. 测试： Feign自带负载均衡规则
###超时控制
####超过一秒钟就会报错
####需要配置yml
	
	#设置feign的超时时间（openfeign默认支持ribbon）
	ribbon:
	  ReadTimeout: 5000  # 指的是建立连接所用的时间， 使用用两端网络正常的原因，两端所用的时间
	  ConnectTimeout: 5000 # 指的是建立连接后从服务器读取到可用资源所用的时间
###日志打印功能
####是什么
* ![](http://qn.qs520.mobi/feefc82c00ece7d798492073e0599c15.png)
####日止级别
* ![](http://qn.qs520.mobi/224a2227b56932c1512615c66f1de08f.png)
####配置日志bean

	@Configuration
	public class FeignConfig {
	
	    @Bean
	    Logger.Level feignLoggerLevel () {
	        return Logger.Level.FULL;
	    }
	}
####yml文件里需要开启日志的Feign客户端
	logging:
	  level:
	    # feign日志以什么级别监控哪个接口
	    com.hnguigu.springcloud.service.PaymentFeignService: debug
####后台日志查看
##5. 服务降级，Hystrix断路器
###概述
* ![](http://qn.qs520.mobi/1a707d63af40416a17fc3de17ff719ce.png)
####能干嘛：服务降级，服务熔断，接近实时的监控
###Hystrix重要概念
####服务降级
* 作用： **不让客户端等待并l立刻返回一个友好提示， fallback**
* 哪些情况会触发降级
	* 程序运行异常
	* 超时
	* 服务熔断触发服务降级
	* 线程池/信号量打满也会导致服务降级
####服务熔断
* 类比保险丝达到最大访问后，直接拒绝访问，拉闸断电，然后调用服务降级的方法并返回友好提示
####服务限流
* 秒杀高并发等操作，严禁一窝蜂的拥挤过来，大家排队，一秒钟N个，有序进行
###Hystrix案例(解决方案)
####服务降级
#####1. 8001fallback
* 业务类启用： **@HystrixCommand**
* 主启动类激活： **添加这个注解@EnableCircuitBreaker**

		//表示使用哪个方法兜底，就是出异常或者超时后会执行这个方法
		    @HystrixCommand(fallbackMethod = "payemntInfo_TimeOutHandler", commandProperties = {
		            @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value="3000")
		            // timeoutInMilliseconds  这个线程的超时时间是3秒
		    })
		    public String payemntInfo_TimeOut (Integer id) {
		        int a = 10/0;
		        return "线程池： " + Thread.currentThread().getName() + "payemntInfo_TimeOut, id:" + id + "耗时(秒)";
		//        int time = 5;
		//        try { TimeUnit.SECONDS.sleep(time); } catch (InterruptedException e) { e.printStackTrace(); }
		//        return "线程池： " + Thread.currentThread().getName() + "payemntInfo_TimeOut, id:" + id + "耗时(秒)" + time;
		    }
		
		    public String payemntInfo_TimeOutHandler (Integer id) {
		        return "线程池： " + Thread.currentThread().getName() + "payemntInfo_TimeOutHandler, id:" + id + "兜底方法";
		    }

		然后在主启动类上加@EnableCircuitBreaker这个注解，即可实现服务降级，不管出异常还是超时都会进兜底方法
#####2. 80fallback(服务降级一般放在客户端)
* 先配置yml

		spring:
		  application:
		    name: cloud-hystrix-order
		
		feign:
		  hystrix:
		    enabled: true
* 在controller里加上

		@GetMapping("/order/payment/hystrix/timeout/{id}")
	    @HystrixCommand(fallbackMethod = "orderInfo_TimeOutMethods", commandProperties = {
	            @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "1500")
	    })
	    public String payemntInfo_TimeOut (@PathVariable Integer id) {
	        return  orderHystrixService.payemntInfo_TimeOut(id);
	    }
	
	    public String orderInfo_TimeOutMethods(@PathVariable("id") Integer id) {
	        return  "80兜底方法";
	    }
* 然后在80主启动类上加注解： **@EnableHystrix**
#####目前问题：
* 每一个业务类对应一个兜底方法，代码膨胀
* 与业务逻辑代码混合了
#####解决问题
* 每个方法配置一个？？？膨胀
	* 在controller上加**@DefaultProperties(defaultFallback = "globalFallBack")**注解，其中globalFallBack是一个方法，被指定成全局异常处理方法。 在controller方法上只写@HystrixCommand即可，**这样通用的和独享 的就分开了，减少代码量**
* 与业务逻辑代码混一起？？？混乱
	* 写一个类实现有feign接口的接口，然后重写类里的方法，再到接口的**@FeignClient(value = "CLOUD-PROVIDER-HYSTRIX-PAYMENT")**注解上加**, fallback = PaymentFallbackService.class**，再到yml里配置一下
			
			feign:
			  hystrix:
			    enabled: true
* ![](http://qn.qs520.mobi/ded67be182b2424575db2510be52ea68.png)
####服务熔断
* ![](http://qn.qs520.mobi/bb406184aa8e778dfd3ed6bcfb1ad35e.png)
* ![](http://qn.qs520.mobi/77a8f1a80becc11b91bbdf63ca3e62f8.png)
* ![](http://qn.qs520.mobi/191e6d542e97ec4989e2ac28e39e8221.png)
####服务限流
* 高级篇Sentinel讲
###Hystrix工作流程
* ![](http://qn.qs520.mobi/c7a77555f2a34a59e85f7b3a0d87fe7a.png)

		1请求进来,首先查询缓存,如果缓存有,直接返回
		  	如果缓存没有,--->2
		2,查看断路器是否开启,如果开启的,Hystrix直接将请求转发到降级返回,然后返回
		  	如果断路器是关闭的,
						判断线程池等资源是否已经满了,如果已经满了
		  					也会走降级方法
		  			如果资源没有满,判断我们使用的什么类型的Hystrix,决定调用构造方法还是run方法
		        然后处理请求
		        然后Hystrix将本次请求的结果信息汇报给断路器,因为断路器此时可能是开启的
		          			(因为断路器开启也是可以接收请求的)
		        		断路器收到信息,判断是否符合开启或关闭断路器的条件,
						如果本次请求处理失败,又会进入降级方法
		        如果处理成功,判断处理是否超时,如果超时了,也进入降级方法
		        最后,没有超时,则本次请求处理成功,将结果返回给controller
###服务监控HystrixDashboard
* ![](http://qn.qs520.mobi/c3f4943a8a092addbf2d446ff64ec5fb.png)
* ![](http://qn.qs520.mobi/0a85cf94e0db98ce42e0b5633c3942d8.png)
####断路器演示

	需要在被监控的工程的主启动类里加如下代码

    /**
     * 此配置是为了服务监控而配置，与服务 容错本身无关，springcloud 升级后的坑
     * ServletRegistrationBean因为springboot的默认路径不是"/hystcix. stream",
     * 只要在自己的项目里配置上:下面的servlet就可以了
     **/
    @Bean
    public ServletRegistrationBean getServlet() {
        HystrixMetricsStreamServlet streamServlet = new HystrixMetricsStreamServlet();
        ServletRegistrationBean registrationBean = new ServletRegistrationBean(streamServlet);
        registrationBean.setLoadOnStartup(1);
        registrationBean.addUrlMappings("/hystrix.stream");
        registrationBean.setName("HystrixMetricsStreamServlet");
        return registrationBean;
    }

* ![](http://qn.qs520.mobi/9c130b51d36e340bf50a84ca8c31d4df.png)
##6. 服务网关gateway
###简介
####SpringCloud Gateway使用的Webflex中的reactor-netty响应式编程组件， 底层使用了netty通讯框架
* ![](http://qn.qs520.mobi/fd7671a28c66ae75bcb2e46a846c0298.png)
####能干嘛： 反向代理，鉴权， 流量控制， 熔断， 日志监控
* ![](http://qn.qs520.mobi/59ce3c68c98662e5387b7a2a5a81c30a.png)
###三大核心概念
####路由：构建网关的基本模块，它是由ID， 目标URI， 一系列断言和过滤器组成，如果断言为true则匹配该路由
####Predicate(断言)：参考的是Java8的java.util.function.Predicate,开发人员可以匹配HTTP请求中的所有内容(例如请求头或请求参数)，如果请求与断言相匹配则进行路由
####Filter(过滤):指的是Spring框架中GatewayFilter的实例，使用过滤器，可以在请求被路由前或者之后对请求进行修改。
####总体
* ![](http://qn.qs520.mobi/c70e41ce5d38d0310863631fc6869df5.png)
###Gateway工作流程
* ![](http://qn.qs520.mobi/b6d0bf5f4513b255a2d44d18ba425f62.png)
###入门配置
* ![](http://qn.qs520.mobi/6d31e620dfec2fa8c1c39ca0d237e861.png)
###通过微服务名实现动态路由
* ![](http://qn.qs520.mobi/a50b6b7334c129b5ce0acd6b2529970c.png)
###Predicate的使用 
* ![](http://qn.qs520.mobi/8dfe7d070f29b9bccec299e31baa5986.png)
###Filter的使用
####自定义Filter
* ![](http://qn.qs520.mobi/6e7951e7f1363641a4420f111572b508.png)
##7. 分布式配置中心SpringCloud Config
###概述
####是什么
* ![](http://qn.qs520.mobi/a098ec24da3dd5361b87143f28066e10.png)
###Config服务端配置与测试
####先使用git命令吧仓管clone到本地
* git addr .
* git commit -m "注释"
* git push -u origin master
####pom
	<dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-config-server</artifactId>
    </dependency>
####yml

	server:
	  port: 3344
	
	spring:
	  application:
	    name: cloud-config-center
	  cloud:
	    config:
	      server:
	        git:
	          uri: git@github.com:a1459608577/springcloud-config.git  #github上仓库的名字
	          search-paths:  # 搜索目录
	            - springcloud-config
	      label: master  #读取分支
	eureka:
	  client:
	    service-url:
	      defaultZone: http://eureka7001.com:7001/eureka
####启动类

	@SpringBootApplication
	@EnableConfigServer
	public class ConfigCenterMain3344 {
	
	    public static void main(String[] args) {
	        SpringApplication.run(ConfigCenterMain3344.class, args);
	    }
	}
####增加映射 127.0.0.1 config-3344.com
####从git上获取内容
####配置的读取规则
* ![](http://qn.qs520.mobi/5968113321226eb18b9700a3d9f94bb2.png)
###Config客户端配置与测试
####其他配置都一样，不一样的写在下面
* ![](http://qn.qs520.mobi/14d80cba4015febe19e533c9c44fbe99.png)
###Config客户端之动态刷新
* ![](http://qn.qs520.mobi/15d52b18c852fd6df6d828a28e025fe1.png)
##8. SpringCloud Bus消息总线
###概述
* ![](http://qn.qs520.mobi/7870b542dd77a4158f9be6b84d3eae60.png)
###SpringCloud Bus动态刷新全局广播
* ![](http://qn.qs520.mobi/8454e969af4ce43e96918dfdb68c8fad.png)
###SpringCloud Bud动态刷新定点通知
* ![](http://qn.qs520.mobi/792dfbdd14d5e70036e840621f1bd33e.png)
##9. SpringCloud Stream消息驱动
###概述
####是什么：屏蔽底层消息中间件的差异，降低切换成本， 统一消息的编程模型
* ![](http://qn.qs520.mobi/e08a949e50417396fa77a7bc83404c60.png)
####设计思想
* ![](http://qn.qs520.mobi/bec493bc21ddb00cb77ba377102e91ad.png)
####SpringCloud Stream标准流程套路
* ![](http://qn.qs520.mobi/6ebf1bfc82ef38c902a6f5bed73afbe6.png)
####常用api和常用注解
* ![](http://qn.qs520.mobi/6022caa2487b0fc0190b223689adc26b.png)
###消息驱动之生产者
####pom
	<!--stream rabbit -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
        </dependency>
####yml
	server:
	  port: 8801
	
	spring:
	  application:
	    name: cloud-stream-rabbit-provider
	  cloud:
	    stream:
	      binders: # 在此处配置要绑定的rabbitmq的服务信息
	        defaultRabbit: # 表示定义的名称，用于与binding整合
	          type: rabbit # 消息组件类型
	          environment: # 设置rabbitmq的相关的环境配置
	            spring:
	              rabbitmq:
	                host: localhost
	                port: 5672
	                username: guest
	                password: guest
	      bindings: #  服务的整合处理
	        output: # 这个是一个通道的名称
	          destination: studyEachange # 表示要定义的Exchange的名称
	          content-type: application/json # 设置消息类型  本次为json  文本则设置“text/plain”
	          binders: defaultRabbit # 设置要绑定的消息服务的具体设置， 就是上面的defaultRabbit
	eureka:
	  client:
	    register-with-eureka: true
	    fetch-registry: true
	    service-url:
	      defaultZone: http://eureka7001.com:7001/eureka
	  instance:
	    lease-renewal-interval-in-seconds: 2 # 设置心跳时间间隔(默认是30秒)
	    lease-expiration-duration-in-seconds: 5 # 间隔时间(默认为90秒)
	    instance-id: send-8801.com # 在信息列表时显示主机名称
	    prefer-ip-address: true # 访问路径变为ip地址
####启动类
	@SpringBootApplication
	@EnableEurekaClient
	public class StreamRabbitmqMain8801 {
	
	    public static void main(String[] args) {
	        SpringApplication.run(StreamRabbitmqMain8801.class, args);
	    }
	}
####业务类

	新建一个接口和实现类(service)

	@EnableBinding(Source.class)  // 定义消息的推送管道，就相当于output输出管道
	public class IMessageProviderImpl implements IMessageProvider {
	
	    @Resource
	    private MessageChannel output; //消息发送管理
	
	    @Override
	    public String send() {
	        String s = UUID.randomUUID().toString();
	        output.send(MessageBuilder.withPayload(s).build());
	        System.out.println("***********序列号**" + s);
	        return null;
	    }
	}


	新建controller

	@RestController
	@Slf4j
	public class SendMessageController {
	
	    @Resource
	    private IMessageProvider iMessageProvider;
	
	    @GetMapping("/sendMessage")
	    public String sendMessage() {
	        return iMessageProvider.send();
	    }
	}
###消息驱动之消费者
####一直到业务类之前都是跟生产者一样，唯一不同就是yml文件中的output改成input
####业务类

	@Component
	@EnableBinding(Sink.class)
	public class ReceiveMessageListenerController {
	
	    @Value("${server.port}")
	    private String port;
	
	    @StreamListener(Sink.INPUT)
	    public void input(Message<String> message) {
	        System.out.println("消费者一号*****接受到的消息:" + message.getPayload() + "----端口port：" + port);
	    }
	}
####测试结果：8801发送的uuid在8802这边可以收到
###分组消费与持久化
####消费：存在重复消费的问题，就是一个订单被两个人获取到造成重复消费，原因是两个消费者不是同一个组，默认分组的group不同，组流水号不同，所以可以重复消费，在同一个组的话就不能重复消费了
####分组(解决重复消费)
* ![](http://qn.qs520.mobi/75455b5798c94945360d6d2ce9188345.png)
####持久化
* ![](http://qn.qs520.mobi/99ad94d4fe1b5cdddee03a02231a8e65.png)
##10. SpringCloud Sleuth分布式请求链路跟踪
* ![](http://qn.qs520.mobi/d76870ac1a68f12b5b03fcd5a7614ace.png)
###概述
####在分布式系统中提供追踪解决方案并兼容支持了zipkin
####[官网](https://cloud.spring.io/spring-cloud-sleuth/reference/html/#features)
* ![](http://qn.qs520.mobi/fcb2a8ea2826f1b2d8430f969477bb1c.png)
###搭建链路监控步骤
* ![](http://qn.qs520.mobi/6aa4cb279a999e9c6bd9372096268bc6.png)
##11. SpringCloud Alibaba Nacos服务注册和配置中心，[官方文档](https://spring-cloud-alibaba-group.github.io/github-pages/greenwich/spring-cloud-alibaba.html)
###Nacos简介，[官网](https://nacos.io/zh-cn/)
* ![](http://qn.qs520.mobi/a76d0ae50971e3da853621a78e4e0e8d.png)
###安装并运行Nacos，[下载地址](https://github.com/alibaba/nacos/releases)
####解压后直接运行bin下的startup.cmd命令，运行成功后访问http://localhost:8848/nacos即可，默认账号密码都是nacos
###Nacos作为服务注册中心演示
####生产者的配置pom

	<dependency>   //父pom
		<groupId>com.alibaba.cloud</groupId>
		<artifactId>spring-cloud-alibaba-dependencies</artifactId>
		<version>2.1.0.RELEASE</version>
		<type>pom</type>
		<scope>import</scope>
	</dependency>

	<dependency>  //子pom
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
####yml

	server:
	  port: 9001
	
	spring:
	  application:
	    name: nacos-payment-provider
	  cloud:
	    nacos:
	      discovery:
	        server-addr: 127.0.0.1:8848
	management:
	  endpoints:
	    web:
	      exposure:
	        include: *
####启动类跟之前一样，业务类随便写个能访问的就行
#### 投机取巧的方法，虚拟映射
* ![](http://qn.qs520.mobi/a3a77d0c08f55bed3a21f9a638b30dc5.png)
####消费者配置
* ![](http://qn.qs520.mobi/122a4aab64d5277b51230956f2e4df2d.png)
* ![](http://qn.qs520.mobi/09ad1a28959256c9b4292d0ce7f5bee1.png)
###Nacos作为服务配置中心演示
####Nacao作为配置中心-基础配置
* ![](http://qn.qs520.mobi/bc3d8f113453912281acbc635525259e.png)
* ![](http://qn.qs520.mobi/ad40dfe73e26c6419f35f71ccaf3d8e4.png)
####Nacao作为配置中心-分类配置
* ![](http://qn.qs520.mobi/a4d5377c5087d6302868846db8b30c82.png)
###Nacos集群和持久化配置
####官网说明
* ![](http://qn.qs520.mobi/ce0faff8f8091f4b13020617aafa1f6d.png)
####Nacos持久化配置解释
* ![](http://qn.qs520.mobi/f23a9beb50d9dae3de4aae97b10bc62a.png)
####Linux版Nacos + MySql生产环境配置
* ![](http://qn.qs520.mobi/65ebf7bc4115079833c065a513dd6660.png)
##12. SpringCloud Alibaba Sentinel实现熔断和限流
###Sebtinel
####[官方文档](https://github.com/alibaba/Sentinel/wiki/%E4%BB%8B%E7%BB%8D)，[下载链接](https://github.com/alibaba/Sentinel/releases)
* ![](http://qn.qs520.mobi/0149e1917b258737e8941987ec8c8074.png)
* ![](http://qn.qs520.mobi/5c293f72d9d3c32af9d5756a75bd182d.png)
###初始化演示工程
* ![](http://qn.qs520.mobi/704ac86f570835af34bd9497ead488d1.png)
###流控规则
####基本介绍
* ![](http://qn.qs520.mobi/af55632578736ee930ff249711d74d43.png)
####流控模式
#####直接(默认)
* ![](http://qn.qs520.mobi/07c22c7e39f8d30897053adfa893e4f3.png)
#####关联
* ![](http://qn.qs520.mobi/f2e89ff73e3ee275b827d49c47ced504.png)
* ![](http://qn.qs520.mobi/1736ab8ef5be786f55fbd0d8e3cd1e7e.png)
#####链路
####流控效果
* ![](http://qn.qs520.mobi/e14c54af981e690be94abecb397eaeba.png)
###降级规则
* ![](http://qn.qs520.mobi/d4f13b81290f9c4e36f36b6f369069bc.png)
####降级策略实战
#####1. RT(平均响应时间)
* ![](http://qn.qs520.mobi/7e72a562f70133d035419e25e72a65ac.png)
#####2. 异常比例
* ![](http://qn.qs520.mobi/e74c64c1da3cac32a4adc6fe456ce8f3.png)
#####3. 异常数
* ![](http://qn.qs520.mobi/f6a1b4494ee1d0f569f14c21ccb4053d.png)
###热点key限流
####使用热点规则
* ![](http://qn.qs520.mobi/48abfe13cef88a67e0f74d428f53eabe.png)
####参数例外项
* ![](http://qn.qs520.mobi/a662a77cc36cdb2ffb2e7ca581c3fbd7.png)
###系统规则(系统自适应限流)
* ![](http://qn.qs520.mobi/72c94f4fd0894a1c13eb3adc3a98d97b.png)
###@SentinelResource
* ![](http://qn.qs520.mobi/b58865e05be1efb31f9926e697620348.png)
###服务熔断功能，sentinel整合ribbon + openfeign + fallback
####Ribbon系列
* ![](http://qn.qs520.mobi/7aa241a703c7751f9a250c720829ca30.png)
####Feign系列
* ![](http://qn.qs520.mobi/d58fd3264fbcd3530119a616a2dc03e0.png)
####熔断框架比较
* ![](http://qn.qs520.mobi/e8c8a5152075a1c9379d0df55fd2bfb5.png)
###规则持久化
* ![](http://qn.qs520.mobi/aacbcaa5f43b9acc47a6875b54e67372.png)
##13. SpringCloud Alibaba Seata处理分布式事务
###分布式事务问题
####打个比方，淘宝下单有订单库，有金融库，这两个库看似没有关系，实则是一个事务里的，要么一起成功，要么一起失败，订单失败金额不减少，订单成功金额减少，所以就有了分布式事务的问题
###Seata简介， [官网](http://seata.io/zh-cn/)
####1. Seata是用来解决分布式事务的一个解决方案
* ![](http://qn.qs520.mobi/ba3c1ed2676c4a09f98b5e80ecb211d6.png)
###Seata-Server安装
* ![](http://qn.qs520.mobi/8c319c13e9162fcd3e5d64bfc649315f.png)
###订单/库存/账户业务数据库准备
* ![](http://qn.qs520.mobi/dbf5d6c3149e50bff75310e18480d20f.png)
###订单/库存/账户业务微服务准备
* ![](http://qn.qs520.mobi/8b0b4022f859a0e526f9d166c196e9e1.png)
###Test
###补充
* ![](http://qn.qs520.mobi/2ffef8f2a55a4603a0371907a6ca8f0c.png)











