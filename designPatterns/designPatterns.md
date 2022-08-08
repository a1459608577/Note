#设计模式
##创建型模式的特点和分类
####1. 单例模式（Singleton）
#####&emsp;&emsp;某个类只能生成一个实例，该类提供了一个全局访问点供外部获取该实例，其拓展是有限多例模式。
* **定义**： 指一个类只有一个实例，且该类能自行创建这个实例的一种模式。例如，Windows 中只能打开一个任务管理器，这样可以避免因打开多个任务管理器窗口而造成内存资源的浪费，或出现各个窗口显示内容的不一致等错误。
* **特点**： 
	1. 单例类只有一个实例对象；
	2. 该单例对象必须由单例类自行创建；
	3. 单例类对外提供一个访问该单例的全局访问点。

![](./img/1.png)
#####单例模式的实现
* 懒汉式

		/**
		 * 单例模式
		 * @author ksn
		 * @version 1.0
		 * @date 2021/5/17 14:49
		 */
		public class LazySingleton {
		
		    private static volatile LazySingleton singleton = null;
		
		    /**
		     * private 避免类在外部被实例化 J就不能在外部new LazySingleton()来创建对象了
		     */
		    private LazySingleton() {
		
		    }
		
		    /**
		     * 懒汉式,多线程下可能会不安全，所以加synchronized， 和volatile
		     */
		    public static synchronized LazySingleton getInstance() {
		        if (singleton == null) {
		            singleton = new LazySingleton();
		        }
		        return singleton;
		    }
		}
* 饿汉式

		public class HungrySingleton {
		
		    private static volatile HungrySingleton singleton = new HungrySingleton();
		
		    private HungrySingleton() {}
		
		    public static HungrySingleton getInstance() {
		        return singleton;
		    }
		}

####2. 原型模式（Prototype）
#####&emsp;&emsp;将一个对象作为原型，通过对其进行复制而克隆出多个和原型类似的新实例。
* **定义：**用一个已经创建的实例作为原型，通过复制该原型对象来创建一个和原型相同或相似的新对象。在这里，原型实例指定了要创建的对象的种类。用这种方式创建对象非常高效，根本无须知道对象创建的细节。例如，Windows 操作系统的安装通常较耗时，如果复制就快了很多。

![](./img/2.png)

#####单原型模式的实现
* **浅克隆：**创建一个新的对象，属性与原来的对象相同，对于非基本类型属性还是指向原来的对象
* **深克隆：**创建一个新对象，属性中的对象全部克隆，不在指向原来的对象

		Java 中的 Object 类提供了浅克隆的 clone() 方法，具体原型类只要实现 Cloneable 接口就可实现对象的浅克隆，
		这里的 Cloneable 接口就是抽象原型类。
		public class RealizeType implements Cloneable{
		
		    RealizeType() {
		        System.out.println("具体原型创建成功！");
		    }
		
		    @Override
		    public Object clone() throws CloneNotSupportedException {
		        System.out.println("具体原型复制成功！");
		        return (RealizeType) super.clone();
		    }
		}
		//  测试类
		public class PrototypeTest {
		
		    public static void main(String[] args) throws CloneNotSupportedException {
		        RealizeType realizeType = new RealizeType();
		        RealizeType clone = (RealizeType)realizeType.clone();
		        // false
		        System.out.println(realizeType == clone);
		    }
		}


####3. 工厂方法模式（Factory Method）
#####&emsp;&emsp;定义一个用于创建产品的接口，由子类决定生产什么产品。
* **定义：**定义一个创建产品对象的工厂接口，将产品对象的实际创建工作推迟到具体子工厂类当中。这满足创建型模式中所要求的“创建与使用相分离”的特点。
####3.1 简单工厂模式
![](./img/3.png)

	public class SimpleFactory {
	
	    public static void main(String[] args) {
	        Product product = SimpleFactory.getProduct();
	        product.show();
	    }
	
	
	    interface Product {
	        void show();
	    }
	
	    static class Product1 implements Product {
	
	        @Override
	        public void show() {
	            System.out.println("产品1显示show");
	        }
	    }
	
	    public static Product getProduct() {
	        return new Product1();
	    }
	
	}
####3.2 工厂方法模式
![](./img/4.png)

	public class AbstractFactoryTest {
	    public static void main(String[] args) {
	        try {
	            Product a;
	            AbstractFactory af;
	            af = (AbstractFactory) ReadXML1.getObject();
	            a = af.newProduct();
	            a.show();
	        } catch (Exception e) {
	            System.out.println(e.getMessage());
	        }
	    }
	}
	
	//抽象产品：提供了产品的接口
	interface Product {
	    public void show();
	}
	
	//具体产品1：实现抽象产品中的抽象方法
	class ConcreteProduct1 implements Product {
	    public void show() {
	        System.out.println("具体产品1显示...");
	    }
	}
	
	//具体产品2：实现抽象产品中的抽象方法
	class ConcreteProduct2 implements Product {
	    public void show() {
	        System.out.println("具体产品2显示...");
	    }
	}
	
	//抽象工厂：提供了厂品的生成方法
	interface AbstractFactory {
	    public Product newProduct();
	}
	
	//具体工厂1：实现了厂品的生成方法
	class ConcreteFactory1 implements AbstractFactory {
	    public Product newProduct() {
	        System.out.println("具体工厂1生成-->具体产品1...");
	        return new ConcreteProduct1();
	    }
	}
	
	//具体工厂2：实现了厂品的生成方法
	class ConcreteFactory2 implements AbstractFactory {
	    public Product newProduct() {
	        System.out.println("具体工厂2生成-->具体产品2...");
	        return new ConcreteProduct2();
	    }
	}
####4. 抽象工厂模式（AbstractFactory）
#####&emsp;&emsp;提供一个创建产品族的接口，其每个子类可以生产一系列相关的产品。
####5. 建造者模式（Builder）
#####&emsp;&emsp;一个复杂对象分解成多个相对简单的部分，然后根据不同需要分别创建它们，最后构建成该复杂对象。
##结构型模式概述
####6. 代理模式（Proxy）
#####&emsp;&emsp;为某对象提供一种代理以控制对该对象的访问。即客户端通过代理间接地访问该对象，从而限制、增强或修改该对象的一些特性。
####7. 适配器模式（Adapter）
#####&emsp;&emsp;将一个类的接口转换成客户希望的另外一个接口，使得原本由于接口不兼容而不能一起工作的那些类能一起工作。
####8. 桥接模式（Bridge）
#####&emsp;&emsp;将抽象与实现分离，使它们可以独立变化。它是用组合关系代替继承关系来实现，从而降低了抽象和实现这两个可变维度的耦合度。
####9. 装饰器模式（Decorator）
#####&emsp;&emsp;动态的给对象增加一些职责，即增加其额外的功能。
####10. 外观模式（Facade）门面模式
#####&emsp;&emsp;为多个复杂的子系统提供一个一致的接口，使这些子系统更加容易被访问。
####11. 享元模式（Flyweight）
#####&emsp;&emsp;运用共享技术来有效地支持大量细粒度对象的复用。
####12. 组合模式（Composite）
#####&emsp;&emsp;将对象组合成树状层次结构，使用户对单个对象和组合对象具有一致的访问性。
##行为型模式概述
####13. 模板方法模式（TemplateMethod）
#####&emsp;&emsp;定义一个操作中的算法骨架，而将算法的一些步骤延迟到子类中，使得子类可以不改变该算法结构的情况下重定义该算法的某些特定步骤。
####14. 策略模式（Strategy）
#####&emsp;&emsp;定义了一系列算法，并将每个算法封装起来，使它们可以相互替换，且算法的改变不会影响使用算法的客户。
####15. 命令模式（Command）
#####&emsp;&emsp;将一个请求封装为一个对象，使发出请求的责任和执行请求的责任分割开。
####16. 责任链模式（Chain of Responsibility）
#####&emsp;&emsp;把请求从链中的一个对象传到下一个对象，直到请求被响应为止。通过这种方式去除对象之间的耦合。
####17. 状态模式（State）
#####&emsp;&emsp;允许一个对象在其内部状态发生改变时改变其行为能力。
####18. 观察者模式（Observer）
#####&emsp;&emsp;多个对象间存在一对多关系，当一个对象发生改变时，把这种改变通知给其他多个对象，从而影响其他对象的行为。
####19. 中介者模式（Mediator）
#####&emsp;&emsp;定义一个中介对象来简化原有对象之间的交互关系，降低系统中对象间的耦合度，使原有对象之间不必相互了解。
####20. 迭代器模式（Iterator）
#####&emsp;&emsp;提供一种方法来顺序访问聚合对象中的一系列数据，而不暴露聚合对象的内部表示。
####21. 访问者模式（Visitor）
#####&emsp;&emsp;在不改变集合元素的前提下，为一个集合中的每个元素提供多种访问方式，即每个元素有多个访问者对象访问。
####22. 备忘录模式（Memento）
#####&emsp;&emsp;在不破坏封装性的前提下，获取并保存一个对象的内部状态，以便以后恢复它。
####23. 解释器模式（Interpreter）
#####&emsp;&emsp;提供如何定义语言的文法，以及对语言句子的解释方法，即解释器。
##举例：
####[SpringSecurity八种常用设计模式](https://mp.weixin.qq.com/s?__biz=MzI1NDY0MTkzNQ==&mid=2247489462&idx=2&sn=90f1d627cc704264623abd1efb4fb79c&chksm=e9c345d6deb4ccc05e20adc7c4a47577db7e02f8fdb8cdf13f0895e1158c803474495b2a7c9b&scene=178&cur_album_id=1319828555819286528#rd)