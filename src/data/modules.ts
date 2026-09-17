import type { LabModule } from '../types';

export const modules: LabModule[] = [
  {
    id: 'tokenization',
    title: 'Tokenization',
    stage: 'DATA',
    solves: '把自然语言变成模型可以索引的离散符号序列。',
    input: 'Raw text',
    output: 'Token ids',
    why: '神经网络不能直接处理字符串，必须先把文本切成 token，再映射成稳定的数字 id。',
    position: 'Transformer 流程的入口，决定后续所有向量计算的基本颗粒度。',
    example:
      '“The animal didn’t cross the street because it was too tired.” 会被切成 The / animal / didn’t / cross / ... / it / ...，模型真正看到的是这些 token 的 id。',
    misconception: 'token 不一定等于单词。中文、英文缩写、标点、罕见词都可能以不同粒度拆分。',
    beginner:
      '你可以把 tokenization 理解成把句子切成模型认识的积木。每块积木都有编号，后面的模型只处理编号对应的向量。',
    research:
      'Tokenizer 选择会影响长文本成本、罕见词覆盖、跨语言表现和模型压缩效率。BPE、WordPiece、SentencePiece 本质上是在词表大小和组合能力之间做折中。',
    mathematical:
      'Tokenizer 定义了映射 f: text -> [t_1, ..., t_n]，随后查表 E[t_i] 得到每个 token 的初始向量。',
  },
  {
    id: 'embedding',
    title: 'Embedding',
    stage: 'DATA',
    solves: '把离散 token id 转成连续向量，让语义可以参与线性代数计算。',
    input: 'Token ids',
    output: 'Dense vectors',
    why: 'id 只是编号，没有距离、方向和语义。embedding 让 animal、creature、tired 等词在向量空间中产生可学习的关系。',
    position: 'Tokenization 之后，Position Encoding 之前。',
    example:
      'animal 与 tired 在某些语义维度上更接近，而 street 更偏向地点和物体。这个差异会影响后续 it 的注意力分配。',
    misconception: 'embedding 不是固定词典释义，而是训练中学出的坐标系。',
    beginner:
      '每个 token 会拿到一串数字。这串数字不是随机标签，而是模型用来表达含义的坐标。',
    research:
      'Embedding matrix 是模型参数的一部分。训练会不断调整它，使高维空间里的方向承载语义、句法和任务相关信号。',
    mathematical:
      '给定词表 V 和维度 d_model，embedding table E ∈ R^{|V| × d_model}，token t 的向量为 x_t = E[t]。',
  },
  {
    id: 'positional-encoding',
    title: 'Positional Encoding',
    stage: 'DATA',
    solves: '为并行处理的 token 注入顺序信息。',
    input: 'Embedding vectors',
    output: 'Position-aware vectors',
    why: 'Self-attention 本身同时看所有 token，不像 RNN 天然知道先后顺序，因此必须加入位置信号。',
    position: 'Embedding 后，与 token 向量相加后进入第一个 attention block。',
    example:
      '“I love AI” 与 “AI love I” 的 token 集合相似，但位置不同，含义完全不同。',
    misconception: '位置编码不是装饰项。没有位置，模型很难区分顺序变化。',
    beginner:
      '模型不仅要知道有哪些词，还要知道它们排在哪里。位置编码就是给每个 token 贴上坐标。',
    research:
      '位置方案可以是固定正余弦、可学习绝对位置、相对位置、RoPE 或 ALiBi。不同方案会影响长上下文外推能力。',
    mathematical:
      '输入表示通常写作 z_i = E[t_i] + P_i，其中 P_i 是第 i 个位置的编码。',
    formula: 'PE(pos, 2i)=sin(pos/10000^{2i/d}); PE(pos, 2i+1)=cos(pos/10000^{2i/d})',
  },
  {
    id: 'qkv',
    title: 'Query / Key / Value',
    stage: 'MODEL',
    solves: '把每个 token 拆成“我要找什么、我如何被匹配、我提供什么信息”三种角色。',
    input: 'Position-aware token vectors',
    output: 'Q, K, V vectors',
    why: '同一个 token 在不同关系里角色不同。Q/K/V 让模型可以用匹配分数决定从哪里读取信息。',
    position: 'Self-attention 的准备阶段。',
    example:
      'it 的 Query 会寻找可指代对象；animal 的 Key 更容易匹配 it；street 的 Key 匹配度较低；最终 it 更多读取 animal 的 Value。',
    misconception: 'Q/K/V 不是三个不同词表，而是同一个 token 表示经过三组线性投影后的结果。',
    beginner:
      'Query 像问题，Key 像索引，Value 像真正要取走的信息。先匹配问题和索引，再按权重读取信息。',
    research:
      'Q、K、V 来自可学习矩阵 W_Q、W_K、W_V。不同 head 使用不同投影子空间，从而捕捉不同关系。',
    mathematical:
      'Q = XW_Q, K = XW_K, V = XW_V，其中 X 是输入 token 表示矩阵。',
    formula: 'Q = XW_Q, K = XW_K, V = XW_V',
  },
  {
    id: 'scaled-attention',
    title: 'Scaled Dot-Product Attention',
    stage: 'MODEL',
    solves: '计算每个 token 应该从其它 token 读取多少信息。',
    input: 'Q, K, V',
    output: 'Contextual vectors',
    why: '语言理解依赖上下文。attention 让每个 token 都能按相关性聚合其它 token 的 Value。',
    position: 'Transformer block 的核心计算。',
    example:
      '在 pronoun reference 例子中，it 对 animal 的权重更高，对 street 的权重更低，因此输出向量更像“有生命的对象”。',
    misconception: 'attention weight 不是最终答案，只是一次信息路由。后面还有多层、FFN 和输出头。',
    beginner:
      '模型先给每个 token 之间的关系打分，再把分数变成比例，最后按比例混合信息。',
    research:
      'scale 项抑制高维点积方差，softmax 把 logits 转成归一化分布，权重矩阵乘以 V 得到上下文化表示。',
    mathematical:
      '核心公式是 Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V。',
    formula: 'Attention(Q,K,V)=softmax(QK^T / sqrt(d_k))V',
  },
  {
    id: 'multi-head',
    title: 'Multi-Head Attention',
    stage: 'MODEL',
    solves: '让模型并行从多种关系视角阅读同一句话。',
    input: 'Multiple projected Q/K/V subspaces',
    output: 'Concatenated contextual representation',
    why: '一个 head 容量有限，多头可以分别关注语法、指代、局部短语和长距离依赖。',
    position: 'Self-attention 的并行扩展，然后 concat 并线性投影回 d_model。',
    example:
      '同一个 it，某个 head 看 animal，另一个 head 看 was too tired，还有 head 关注 because 形成的因果关系。',
    misconception: '多头不是重复算很多遍同一件事，而是在不同投影空间中学习互补关系。',
    beginner:
      '像多位研究员同时读一句话，每个人关注点不同，最后把观察合并。',
    research:
      '每个 head 有独立的 W_Q/W_K/W_V，输出 concat 后经 W_O 融合。head 数量影响表达能力和计算成本。',
    mathematical:
      'MultiHead(Q,K,V)=Concat(head_1,...,head_h)W_O。',
    formula: 'head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)',
  },
  {
    id: 'add-norm',
    title: 'Add & Norm',
    stage: 'MODEL',
    solves: '让深层网络保持稳定，并保留原始信号。',
    input: 'Layer input and sublayer output',
    output: 'Normalized residual representation',
    why: 'Residual connection 让信息和梯度更容易穿过深层模型，LayerNorm 降低分布漂移。',
    position: 'Attention 后一次，FFN 后一次。',
    example:
      '即使 attention 对某些关系判断不完美，原始 token 表示仍可通过 residual 保留下来。',
    misconception: 'Add & Norm 不是可有可无的后处理，而是深层 Transformer 稳定训练的重要结构。',
    beginner:
      '每层不会完全覆盖上一层的理解，而是把新信息加回去，再整理成稳定格式。',
    research:
      'Pre-LN 与 Post-LN 架构会影响训练稳定性。现代大模型多采用 Pre-LN 或变体来改善深层梯度。',
    mathematical:
      '常见 Post-LN 写法：LayerNorm(x + Sublayer(x))。',
    formula: 'y = LayerNorm(x + Sublayer(x))',
  },
  {
    id: 'ffn',
    title: 'Feed Forward Network',
    stage: 'MODEL',
    solves: '对每个 token 的上下文化表示做非线性特征变换。',
    input: 'Contextual vectors',
    output: 'Refined token representations',
    why: 'Attention 负责 token 间通信，FFN 负责每个 token 内部的特征加工和组合。',
    position: '每个 Transformer block 中 attention 之后。',
    example:
      'it 已经吸收 animal 的信息后，FFN 可以进一步强化“有生命对象 + 疲劳状态”这类特征。',
    misconception: 'FFN 不负责 token 之间交换信息，它对每个位置独立应用同一组 MLP。',
    beginner:
      'Attention 先把信息拿来，FFN 再把拿到的信息加工成更有用的表示。',
    research:
      'FFN 通常是 d_model -> d_ff -> d_model 的两层结构，中间用 GELU/SwiGLU 等激活函数。',
    mathematical:
      'FFN(x)=W_2 activation(W_1x+b_1)+b_2。',
    formula: 'FFN(x)=W_2 GELU(W_1x+b_1)+b_2',
  },
  {
    id: 'encoder',
    title: 'Encoder Stack',
    stage: 'MODEL',
    solves: '逐层构造输入序列的上下文化语义表示。',
    input: 'Position-aware vectors',
    output: 'Deep contextual representations',
    why: '单层只能捕捉有限关系，多层堆叠让表示从局部模式走向抽象语义。',
    position: 'Encoder-only 和 encoder-decoder 模型的主体。',
    example:
      '浅层可能识别 animal/street 是名词，深层会结合 because 和 tired 判断 it 的指代。',
    misconception: '更深不只是“重复更多次”，而是让每层在前一层的表示上继续重组证据。',
    beginner:
      '每经过一层，token 对上下文的理解就更完整一点。',
    research:
      'Encoder block 通常由 self-attention、residual、norm、FFN、residual、norm 组成，输出可用于分类、检索、翻译源端编码等任务。',
    mathematical:
      'H^{l+1}=Block(H^l)，多层递推得到 H^N。',
  },
  {
    id: 'decoder',
    title: 'Decoder & Causal Mask',
    stage: 'DECISION',
    solves: '在不能看未来的约束下逐步生成下一个 token。',
    input: 'Previous generated tokens',
    output: 'Next-token distribution',
    why: '生成任务必须按时间顺序进行。causal mask 防止训练和推理时泄露未来答案。',
    position: 'Decoder-only 语言模型和 encoder-decoder 目标端生成的核心。',
    example:
      '“Transformer is powerful because” 之后，模型先生成 it，再基于 Transformer is powerful because it 生成 can。',
    misconception: 'Decoder 不是一次写完整答案，而是反复预测下一个 token。',
    beginner:
      '生成像接龙。每次只能看已经写出来的内容，再决定下一个词。',
    research:
      'Causal mask 将未来位置 logits 置为 -∞，softmax 后对应权重为 0。KV cache 可避免重复计算历史 key/value。',
    mathematical:
      'mask_{ij}=-∞ if j>i else 0; softmax((QK^T+mask)/sqrt(d_k))V',
    formula: 'softmax((QK^T + M) / sqrt(d_k))V',
  },
  {
    id: 'cross-attention',
    title: 'Encoder-Decoder Attention',
    stage: 'DECISION',
    solves: '让 Decoder 在生成目标语言时读取 Encoder 的源语言语义。',
    input: 'Decoder queries + Encoder keys/values',
    output: 'Source-aware generated representation',
    why: '翻译、摘要等任务需要输出端不断回看输入端。cross-attention 连接了读入和生成。',
    position: 'Encoder-decoder Transformer 的 Decoder block 中，位于 masked self-attention 之后。',
    example:
      '生成“猫”时，Decoder 的 Query 会主要读取 Encoder 中 cat 的 Key/Value；生成“垫子”时会回看 mat。',
    misconception: 'Cross-attention 不是重新编码输入，而是 Decoder 用自己的 Query 去读取 Encoder 已经准备好的信息。',
    beginner:
      '左边读懂英文，右边写中文。写每个中文词时，右边会回头看左边哪个英文词最相关。',
    research:
      'Cross-attention 的 Q 来自 target hidden state，K/V 来自 encoder output，使目标端生成条件化于源序列。',
    mathematical:
      'Q = H_dec W_Q, K = H_enc W_K, V = H_enc W_V。',
    formula: 'Attention(H_dec W_Q, H_enc W_K, H_enc W_V)',
  },
];
