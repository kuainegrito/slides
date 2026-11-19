// This layout is shared by both editions of the journalism timeline (source slide 9).
export function layoutPressTimeline(svg) {
  const trace = svg.querySelector(':scope > path.trace');
  const milestones = [...svg.querySelectorAll(':scope > g.reveal')];
  const logos = [...svg.querySelectorAll(':scope > image')];
  const footer = svg.querySelector(':scope > text:last-child');
  if (!trace || !footer || milestones.length !== 5 || logos.length !== 5) return;

  const baselines = [326, 360, 385, 414, 438, 460];
  for (const [index, milestone] of milestones.entries()) {
    const illustration = milestone.querySelector(':scope > image');
    const pill = milestone.querySelector(':scope > rect');
    const marker = milestone.querySelector(':scope > circle');
    const labels = [...milestone.querySelectorAll(':scope > text')];
    if (!illustration || !pill || !marker || labels.length !== baselines.length) continue;

    const center = Number(labels[0].getAttribute('x'));
    // Keep 6 SVG units between adjacent illustrations while nearly doubling both dimensions.
    illustration.setAttribute('x', center - 92);
    illustration.setAttribute('y', 166);
    illustration.setAttribute('width', 184);
    illustration.setAttribute('height', 132.25);

    const logo = logos[index];
    logo.setAttribute('x', center - 30);
    logo.setAttribute('y', 137);
    logo.setAttribute('width', 60);
    logo.setAttribute('height', 26);

    pill.setAttribute('y', 304);
    labels.forEach((label, i) => label.setAttribute('y', baselines[i]));
    marker.setAttribute('cy', 478);
  }

  trace.setAttribute('d', 'M76 478H903');
  footer.setAttribute('y', 521);
}
