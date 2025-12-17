# 程序编译部署说明
本次程序需要部署五个主要环境：
React、Go、FastAPI、Opengauss Docker、gsql

下面将分别展示环境部署细节。

## 运行环境
Windows下Wsl环境，配置Ubuntu20.04。

## React环境
进入代码根目录，执行:
```
npm install
```
配置React相关环境。

同时可以通过如下指令：
```
bash bash_frontend.sh
```
运行前端服务，默认端口为5173。

## Flask环境

通过Anaconda配置，通过如下命令在根目录创建虚拟环境并且配置Flask相关环境，由于之前有一版本是拿FastAPI制作的，但是华为云的FunctionGraph上面好像不支持FastAPI，所以现在改成了Flask，requirement.txt中包含了FastAPI的环境，但是我懒得创新的了QAQ。

下面是直接上requirement.txt的。
```
conda create -n ourdoc python==3.10.19 --y
conda activate ourdoc
pip install -r requirement.txt
```

在根目录上面通过指令运行后端：
```
bash bash_backend.sh
```



# 软件测试相关方案
## 2025-12-17
目前修改为数据库方面，具体而言，将原来的数据库转换为python，同时转移到华为云上面。由于现在服务已经上云了，所以不需要本地配置对应的环境，目前只需要配置React和Flask环境即可，不用配置数据库那边的了。

华为云公网ip：
```
119.3.183.42
```

登录可以选择使用华为云本身的远程连接工具登录，或者用xshell这种东西也可以，用户名、密码如下：
```
opengauss
123456abc
```

进入数据库之后，进入/opt/opengauss这个文件夹，所有的操作都在这个文件夹中，这个文件夹里面保存的是opengauss的环境配置，可以直接使用。保存我们这个项目的数据库用户为ourdoc，数据库名为db，密码为1234Abcd!

具体指令和功能如下：
```
# 访问命令：
gsql -d db -p 5432

# 所有表：
\dt

# 查看表中内容，使用正常SQL语句即可
SELECT * FROM "(表名)";
SELECT * FROM "public.(表名)";

# 退出
\q
```