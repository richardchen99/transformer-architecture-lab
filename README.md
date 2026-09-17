# Transformer Architecture Lab

An interactive research-style lab for understanding the Transformer architecture through animated token flow, Q/K/V routing, attention heatmaps, multi-head comparison, encoder/decoder behavior, causal masking, and next-token generation.

这个项目的目标不是把 Transformer 写成一篇静态文章，而是把它拆成一套可以操作的“原理驾驶舱”：你可以切换案例、调整动画速度、打开或关闭 attention head、查看矩阵中间结果，并在同一个例子里贯穿理解完整机制。

Research author: 中国人民大学 Richard Chen

Homepage: https://richardchen99.github.io

## Core Idea

Transformer 的核心能力来自一条连续的表示链：

Raw text -> tokens -> embeddings + positions -> Q/K/V -> scaled dot-product attention -> multi-head merge -> residual + normalization -> feed-forward refinement -> encoder/decoder output.

其中 self-attention 让每个 token 根据相关性读取其它 token 的 Value。Decoder 生成文本时会使用 causal mask，确保当前位置不能读取未来 token。

## Interactive Modules

- **Token Flow**: 展示文本如何被切分成 token，并进入 embedding table。
- **Embedding**: 把 token id 转成连续向量，并展示语义距离的直觉。
- **Positional Encoding**: 用正余弦位置波解释为什么顺序信息必须被注入。
- **Query / Key / Value**: 用“问题、索引、内容”解释 Q/K/V 的分工。
- **Scaled Dot-Product Attention**: 展示 $\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$ 的完整计算路径。
- **Multi-Head Attention**: 可打开或关闭不同 head，比较语法、指代、局部上下文和长距离依赖。
- **Add & Norm / FFN**: 解释残差、归一化和前馈网络为什么支撑深层堆叠。
- **Encoder / Decoder**: 对比双向理解、causal mask、自回归 next-token generation 和 cross-attention。
- **Math Console**: 显示 embeddings、Q、K、context vectors 和 attention weights，softmax 行求和可检查。
- **Formula Lens**: 使用 KaTeX 渲染核心公式，避免把数学表达只作为普通文本展示。

## Built-in Examples

- Pronoun Reference: `it -> animal`
- Machine Translation: English to Chinese alignment
- Next Token Prediction: autoregressive generation
- Long Context Dependency: long-range reference
- Chinese Tokenization: 中文 token 粒度示例

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The Vite config uses `base: './'`, so the built `dist/` directory can be hosted as a static site.

## GitHub Pages

This repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

After pushing to `main`:

1. Open the repository on GitHub.
2. Go to **Settings -> Pages**.
3. Set **Source** to **GitHub Actions**.
4. The workflow will build the Vite app and deploy `dist/`.

The expected Pages URL is:

```text
https://richardchen99.github.io/transformer-architecture-lab/
```

## Project Structure

```text
transformer-architecture-lab/
├── .github/workflows/deploy.yml
├── public/
├── src/
│   ├── api/labApi.ts
│   ├── components/
│   ├── data/
│   ├── lib/attention.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Notes on the Attention Utility

The app includes a simplified but real attention computation in `src/lib/attention.ts`.

It produces:

- token embeddings
- Q/K/V projections
- raw attention scores
- scaled scores
- softmax attention weights
- context vectors

For teaching clarity, the embeddings are deterministic mock vectors. They are not trained model weights, but the calculation shape follows the Transformer attention mechanism.

## Extension Ideas

- Add RoPE and ALiBi positional encoding views.
- Compare encoder-only, decoder-only, and encoder-decoder model families.
- Add KV-cache visualization for large language model inference.
- Add a small tokenizer playground for BPE merge steps.
- Export matrix states as CSV for teaching notebooks.
