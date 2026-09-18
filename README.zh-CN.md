# Transformer Architecture Lab

**把 Attention 变成可以观察的过程。**

从一句话出发，沿着 token、向量表示、Q/K/V、注意力权重和上下文读取逐步探索 Transformer。动画负责建立直觉，矩阵和数值帮助你检查直觉；切换视图时，研究的仍然是同一个例子。

[**进入实验室 ↗**](https://richardchen99.github.io/transformer-architecture-lab/) · [配套研究笔记](https://richardchen99.github.io/blog/transformer-architecture-lab-note/) · [English README](README.md) · [本地运行](#本地运行)

作者：**Richard Chen · 中国人民大学 / Renmin University of China** · [个人主页](https://richardchen99.github.io)

[![Transformer 实验室：token 流、注意力热图与数值控制台](docs/assets/overview.jpg)](https://richardchen99.github.io/transformer-architecture-lab/)

*真实运行截图。同一个案例贯穿架构视图、注意力矩阵与公式解释。*

## 可以研究什么

| 问题 | 操作 | 可以观察到的结果 |
| --- | --- | --- |
| 一个 token 怎样获得上下文？ | 沿 Q/K/V 进入 scaled dot-product attention | 原始分数变为权重，再对 Value 加权求和 |
| 因果约束改变了什么？ | 对比不受限与 causal attention | 未来位置不再参与当前读取 |
| 中间数值分别意味着什么？ | 打开 Matrix View 和 Math Console | 检查 embedding、投影、权重和 context vector |
| 各个模块如何组成 Transformer？ | 查看 head lanes、残差/FFN、encoder/decoder | 将可计算的 attention 核心放回整体架构 |
| 自回归生成怎样展开？ | 播放 Next Token Prediction | 跟随预设 token 序列与示意缓存槽位 |

内置 **指代、机器翻译、下一 token 预测、长距离依赖、中文 token 边界** 五组案例，以及 Beginner、Research、Mathematical 三种阅读深度。界面采用英文控件与中文解释。

## 框架图

![可计算 attention 核心与 Transformer 架构、生成示意视图的关系](docs/assets/architecture.png)

*原创框架图：明确区分数值计算核心与周围的概念视图。[可编辑 SVG](docs/assets/architecture.svg) · [图片来源与状态](docs/assets/README.md)。*

## 两分钟开始实验

1. 进入实验室，选择 **Machine Translation**，切换到 **Research**。
2. 选择 **Scaled Dot-Product Attention** 与 **Matrix View**，沿某一 Query 查看完整的七 token 权重行。
3. 对照原始点积、缩放分数和 softmax 权重，检查完整行的权重和约为一。
4. 切换 **Next Token Prediction**，播放 decoder 序列，观察因果信息边界怎样随步骤推进。

翻译案例可以显示完整权重行。较长案例的矩阵或控制台可能只显示部分列；归一化对应的是**完整行**，可见切片的和不一定为一。

<details>
<summary><strong>展开 attention 与 decoder 实验截图</strong></summary>

![七 token 翻译案例的注意力矩阵与完整行归一化检查](docs/assets/attention.jpg)

*Attention 数值检查：七列全部可见，完整行的检查结果显示为 1.00。*

![完成预设续写后的 decoder 面板](docs/assets/decoder.jpg)

*Decoder 流程：通过预设续写和缓存槽位，解释生成步骤的先后关系。*

</details>

## 数学机制与实现范围

Attention 工具实际计算四维确定性 embedding、固定线性投影、点积、缩放、可选因果 mask、softmax 和 Value 读取：

$$
Q=XW_Q,\qquad K=XW_K,\qquad V=XW_V,
$$

$$
A=\mathrm{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}+M\right),
\qquad Z=AV.
$$

Softmax 按行执行；允许访问的位置 mask 为零，被屏蔽的位置为负无穷。演示对中间数值保留三位小数，因此数值检查允许舍入误差。

周围的视图用于说明完整架构。Head 开关控制视觉通道，没有独立计算各个 head 的输出；encoder/decoder 堆叠是概念示意。生成面板采用固定候选分数与预设 token，缓存槽位没有实现数值 KV 复用；候选分数也不要求构成归一化概率。Token 边界预设，向量不来自训练模型。

项目适合**课堂演示、架构讲解与 attention 源码阅读**。若要进一步检查缓存与完整重算是否数值等价，可以继续使用 [LLM Inference Lab](https://github.com/richardchen99/llm-inference-lab)。

## 本地运行

推荐 **Node.js 24**，使用 npm：

```bash
git clone https://github.com/richardchen99/transformer-architecture-lab.git
cd transformer-architecture-lab
npm ci
npm run dev -- --host 127.0.0.1
```

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

技术栈为 React、TypeScript、Vite、Framer Motion 与 KaTeX。实验计算在浏览器中完成，异步 API 形式的辅助函数是本地 stub，无需模型 API 密钥或 GPU。

[Pages 工作流](.github/workflows/deploy.yml) 使用 Node 24 构建并部署 `main`。本仓库目前没有自动化测试脚本。Fork 后可将 Pages source 设为 **GitHub Actions**，发布静态 `dist/`。

## 源码导读

| 入口 | 重点 |
| --- | --- |
| [`src/lib/attention.ts`](src/lib/attention.ts) | 确定性 embedding、Q/K/V、mask、softmax 与 context vector |
| [`src/components/`](src/components/) | 注意力检查、head 通道、架构面板与 decoder 播放 |
| [`src/data/`](src/data/) | 预设案例及解释材料 |
| [`src/api/labApi.ts`](src/api/labApi.ts) | 界面使用的本地异步 stub |
| [`src/App.tsx`](src/App.tsx) · [`src/styles.css`](src/styles.css) | 共享实验状态与视觉系统 |

## 阅读与引用

- Vaswani 等：[Attention Is All You Need](https://arxiv.org/abs/1706.03762)，2017，Transformer 原始论文。
- Harvard NLP：[The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/)，面向实现的阅读材料。
- [配套研究笔记](https://richardchen99.github.io/blog/transformer-architecture-lab-note/)，串联各个交互模块的中文讲解。

用于课程或文章时，可链接本仓库并记录所用 commit。[CITATION.cff](CITATION.cff) 提供机器可读的软件署名信息。

## 系列实验室

| 项目 | 核心问题 |
| --- | --- |
| [Tokenizer Playground](https://github.com/richardchen99/tokenizer-playground) | 语料怎样变成可复用词表？ |
| **Transformer Architecture Lab** | Attention 怎样把 token 表示转为上下文？ |
| [Position Encoding Lab](https://github.com/richardchen99/position-encoding-lab) | 位置怎样改变注意力几何？ |
| [LLM Inference Lab](https://github.com/richardchen99/llm-inference-lab) | 什么条件下可以复用历史计算？ |
| [LLM RL Lab](https://github.com/richardchen99/llm-rl-lab) | 奖励怎样改变回答分布？ |

如果它对你的学习或教学有帮助，欢迎点亮 Star，让更多人发现这个系列。也欢迎附带复现步骤的 issue，以及针对实验机制的改进。
