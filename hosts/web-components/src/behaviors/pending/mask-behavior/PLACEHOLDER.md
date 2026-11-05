# `wx-mask-behavior` 占位

> 未实现。本目录由 [内置组件与 behaviors 缺口清单](../../../../../../docs/builtin-inventory-2.33.0.md) 生成。

| 项 | 值 |
| --- | --- |
| 参考 behavior | `wx-mask-behavior` |
| 建议 Tiny id | `tiny-mask-behavior` |
| 类别 | 共享 |
| 参考使用方 | toast, action-sheet, modal |
| 现状 | `createBuiltinBehaviors` 未暴露 |

## 实现提示

- 先确认它是纯 DOM 行为，还是要等原生/宿主能力（`wx-native*`、`wx-player`、`wx-positioning-*` 属于后者）。
- 对应组件实现落地时再抽取行为，避免先写空壳导致组件依赖一个假的 behavior。

## 清单

- [ ] 新建 `src/behaviors/maskBehavior.ts`，导出 `createMaskBehaviorBehavior(space)`
- [ ] 在 `src/behaviors/ids.ts` 注册 `tiny-mask-behavior`
- [ ] 在 `src/behaviors/index.ts` 的 `createBuiltinBehaviors` 暴露
- [ ] 接入相关组件并补单测
- [ ] 删除本目录并运行 `pnpm --filter @tiny/host-web-components test`
