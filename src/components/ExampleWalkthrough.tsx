import { motion } from 'framer-motion';
import { BookOpenCheck, CircleHelp, LocateFixed, Route } from 'lucide-react';
import type { LabExample, LabModule } from '../types';

interface ExampleWalkthroughProps {
  example: LabExample;
  modules: LabModule[];
  activeModuleId: string;
  onModuleSelect: (moduleId: string) => void;
}

const misconceptions = [
  {
    title: 'Transformer 不是简单记忆单词',
    copy: '它学习的是上下文中的表示变换。一个 token 的含义会随着周围 token 改变，而不是只查固定词典。',
  },
  {
    title: 'Attention 不是唯一能力来源',
    copy: 'Attention 负责信息路由，FFN、归一化、残差、位置编码和训练目标共同决定最终能力。',
  },
  {
    title: '多头不是重复计算',
    copy: '每个 head 有不同投影空间，可以分别学习语法、指代、长距离依赖和局部结构。',
  },
  {
    title: 'Decoder 不能看未来 token',
    copy: 'Causal mask 会把未来位置遮住。训练时也是如此，否则模型会偷看答案。',
  },
  {
    title: '位置编码不是可有可无',
    copy: '没有位置信息，self-attention 很难分辨同一组 token 的不同顺序。',
  },
];

export function ExampleWalkthrough({ example, modules, activeModuleId, onModuleSelect }: ExampleWalkthroughProps) {
  return (
    <section className="sectionBand" id="walkthrough">
      <div className="sectionIntro">
        <span className="eyebrow">EXAMPLE WALKTHROUGH</span>
        <h2>用一个例子穿过完整 Transformer 流程</h2>
        <p>
          当前案例会贯穿 tokenization、embedding、attention、encoder/decoder 和输出生成，让每个模块都落到同一条证据链上。
        </p>
      </div>

      <div className="walkthroughLayout">
        <div className="walkthroughRail">
          {modules.map((module, index) => (
            <motion.button
              key={module.id}
              type="button"
              className={activeModuleId === module.id ? 'walkStep active' : 'walkStep'}
              onClick={() => onModuleSelect(module.id)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{module.title}</strong>
              <small>{module.solves}</small>
            </motion.button>
          ))}
        </div>

        <div className="walkthroughDetail">
          <div className="detailHeader">
            <BookOpenCheck size={22} />
            <div>
              <span>{example.label}</span>
              <h3>{example.input}</h3>
            </div>
          </div>
          <div className="tokenWrap large">
            {example.tokens.map((token, index) => (
              <motion.b
                className={token === example.focusToken ? 'focusToken' : ''}
                key={`${token}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.025, type: 'spring', stiffness: 260, damping: 24 }}
              >
                {token}
              </motion.b>
            ))}
          </div>
          <div className="evidenceChain">
            <div>
              <LocateFixed size={18} />
              <strong>Focus</strong>
              <p>{example.focusToken}</p>
            </div>
            <div>
              <Route size={18} />
              <strong>Output</strong>
              <p>{example.output}</p>
            </div>
          </div>
          <p className="narrativeCopy">{example.story}</p>
        </div>
      </div>

      <div className="misconceptionGrid">
        {misconceptions.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: index * 0.04 }}
          >
            <CircleHelp size={18} />
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
