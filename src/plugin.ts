import type { PluginEvent, PluginUIEvent } from './common/types';

penpot.ui.open('Waves Generator', `?theme=${penpot.theme}`, {
  width: 670,
  height: 500,
});

penpot.ui.onMessage<PluginUIEvent>((message) => {
  if (message.type === 'create-pattern') {
    const { data, name } = message.content;

    if (!data || !name) return;

    const center = penpot.viewport.center;
    const undoBlockId = penpot.history.undoBlockBegin();
    const group = penpot.createShapeFromSvg(data);

    if (group) {
      group.name = name;
      group.x = center.x;
      group.y = center.y;
    }

    penpot.history.undoBlockFinish(undoBlockId);
  }
});

// Update the theme in the iframe
penpot.on('themechange', (theme) => {
  sendMessage({ type: 'themechange', content: theme });
});

const sendMessage = (message: PluginEvent) => {
  penpot.ui.sendMessage(message);
};
