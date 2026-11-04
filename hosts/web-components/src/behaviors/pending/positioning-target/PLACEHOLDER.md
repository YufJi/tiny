# `wx-positioning-target` 占位

> 未实现。本目录由 [内置组件与 behaviors 缺口清单](../../../../../../docs/builtin-inventory-2.30.1.md) 生成。

| 项 | 值 |
| --- | --- |
| 参考 behavior | `wx-positioning-target` |
| 建议 Tiny id | `tiny-positioning-target` |
| 类别 | 共享 |
| 参考使用方 | camera, canvas, cover-view, cover-image, input, live-player, live-pusher, map, textarea, video, voip-room, web-view |
| 现状 | `createBuiltinBehaviors` 未暴露 |

## 实现提示

- 先确认它是纯 DOM 行为，还是要等原生/宿主能力（`wx-native*`、`wx-player`、`wx-positioning-*` 属于后者）。
- 对应组件实现落地时再抽取行为，避免先写空壳导致组件依赖一个假的 behavior。

## 清单

- [ ] 新建 `src/behaviors/positioningTarget.ts`，导出 `createPositioningTargetBehavior(space)`
- [ ] 在 `src/behaviors/ids.ts` 注册 `tiny-positioning-target`
- [ ] 在 `src/behaviors/index.ts` 的 `createBuiltinBehaviors` 暴露
- [ ] 接入相关组件并补单测
- [ ] 删除本目录并运行 `pnpm --filter @tiny/host-web-components test`
