# Git命令

### 查看日志

```
git log // 日志
git log --pretty=oneline --abbrev-commit // 详细日志
```

### 版本回退   

```
git reset --hard 版本号
git reset --hard HEAD^ (HEAD^表示回退到上一个版本HEAD^^表示回退到上上个)
git push origin HEAD --force // 把本地代码强行推送到远程分支，回退代码时先回退本地代码然后强行推送到远分支
```

### 查看执行过的每条命令

```
git reflog
```

### 添加到暂存区

```
git add a.txt
```

### 添加到本地仓库

```
git commit -m "提交备注"
```

### 查看工作区状态

```
 git status
```

### 查看工作区和版本库中的差别

```
git diff HEAD -- a.txt
```

### 放弃对工作区的修改，回到最近一次add或commit的状态

```
git checkout -- a.txt
```

### 删除已经提交到工作区的文件

* 直接删除不能用checkout回退修改	

		git rm a.txt
		git commit -m "删除a.txt"
	
* 可以用checkout回退

		rm a.txt
		git rm a.txt // 直接删除
		git checkout -- a.txt // 误删之后重新回退到a.txt还在的时候
		git commit -m "内容"
## 关联远程仓库

```
git remote add origin git@github.com:(用户名)/(项目名).git
git push -u origin master
git push -u origin master -f //强行推送
```

### 删除远程仓库关联信息

```
git remote rm origin 
```

### 删除远程仓库分支

```
git push origin --delete 分支名
```

### 从远程仓库clone

```
git clone git仓库地址
```

### 创建并切换分支

```
git checkout -b dev
```

### 查看分支列表

```
git branch
```

### 合并指定分支到当前分支

```
git merge dev
```

### 删除分支

```
git branch -d dev
```

### 解决冲突

```
当两个分支都提交后，找到冲突的文件，然后进行修改，修改完后再提交使用：
git log --graph --pretty=oneline --abbrev-commit
查看分支合并情况
```

### 保存当前所做的修改

```
git stash
```

### 查看所有当前所做的修改

```
git stash list
```

### 把之前所做的修改更新到现在master上

```
git stash apply stash@{0} (这个是可以选的，不会删除原来的stash)
git stash pop (这个会把之前所做的修改同步到现在并且吧这个记录删掉)
```

### 出现的bug在其他分支也出现了，可以复制修改bug的分支对代码所做的变动到其他分支

```
git cherry-pick <commit> (修复完后的分支提交代码返回的commit)
```

### 删除一个没有合并过的分支

```
git branch -D 分支名
```

### 查看远程分支详细信息

```
git remote -v
```

### 推送分支

```
git remote origin 要推送的分支名
```

### 多人协作不能提交，原因远程仓库的代码比本地新，需要先pull

```
git pull
git push origin main
```

### 把分叉提交历史变成直线

```
git rebase
```

### 创建标签

```
git tag 标签名
```

### 查看所有标签

```
git tag
```

### 给指定的commit打赏标签

```
git tag -a 标签名 -m "描述" 45sad25(commit的版本号)
```

### 查看标签详情

```
git show 标签名
```

### 删除标签

```
git tag -d 标签名
```

### 把标签推送到远程仓库

```
git push origin tagName
```

### 一次推送所有未推送的标签

```
git push origin --tags
```

### 删除远程仓库标签，得先删本地的

```
git push origin :refs/tags/<tagname>
```

### 配置命令的别名

```
git config --global alias.ci commit
git ci -m "" 等价于 git commit -m ""
```







# git报错

### fatal: remote origin already exists.  出现在绑定远程仓库的时候

#### 解决办法：

```
	git remote -v 查看远程库信息	
	git remote rm origin (删除关联的origin的远程库)
	git remote add origin git@github.com:(用户名)/(项目名).git
```

