/**
 * An array of status effect icons which can be applied to Tokens
 * @type {Array}
 */
CONFIG.statusEffects = [
  "modules/conditions5e/icons/dead.svg",
  "modules/conditions5e/icons/unconscious.svg",
  "modules/conditions5e/icons/stunned.svg",
  "modules/conditions5e/icons/exhaustion1.svg",

  "modules/conditions5e/icons/incapacitated.svg",
  "modules/conditions5e/icons/paralyzed.svg",
  "modules/conditions5e/icons/petrified.svg",
  "modules/conditions5e/icons/exhaustion2.svg",

  "modules/conditions5e/icons/grappled.svg",
  "modules/conditions5e/icons/restrained.svg",
  "modules/conditions5e/icons/prone.svg",
  "modules/conditions5e/icons/exhaustion3.svg",

  "modules/conditions5e/icons/charmed.svg",
  "modules/conditions5e/icons/frightened.svg",
  "modules/conditions5e/icons/poisoned.svg",
  "modules/conditions5e/icons/exhaustion4.svg",

  "modules/conditions5e/icons/blinded.svg",
  "modules/conditions5e/icons/deafened.svg",
  "modules/conditions5e/icons/diseased.svg",
  "modules/conditions5e/icons/exhaustion5.svg"
];
  
// Condition Types
CONFIG.conditionTypes = {
  "blinded": "Blinded",
  "charmed": "Charmed",
  "dead": "Dead",
  "deafened": "Deafened",
  "diseased": "Diseased",
  "exhaustion": "Exhaustion",
  "exhaustion1": "Exhaustion Level 1",
  "exhaustion2": "Exhaustion Level 2",
  "exhaustion3": "Exhaustion Level 3",
  "exhaustion4": "Exhaustion Level 4",
  "exhaustion5": "Exhaustion Level 5",
  "frightened": "Frightened",
  "grappled": "Grappled",
  "incapacitated": "Inacapacitated",
  "invisible": "Invisible",
  "paralyzed": "Paralyzed",
  "petrified": "Petrified",
  "poisoned": "Poisoned",
  "prone": "Prone",
  "restrained": "Restrained",
  "stunned": "Stunned",
  "unconscious": "Unconscious",
  "wounded": "Wounded"
};

  /**
   * The control icons used for rendering common HUD operations
   * @type {Object}
   */
CONFIG.controlIcons = {
    combat: "icons/svg/combat.svg",
    visibility: "modules/conditions5e/icons/invisible.svg",
    effects: "icons/svg/aura.svg",
    lock: "icons/svg/padlock.svg",
    up: "icons/svg/up.svg",
    down: "icons/svg/down.svg",
    defeated: "modules/conditions5e/icons/dead.svg"
  };
  
CombatTracker.prototype._onCombatantControl = async function(event) {
  event.preventDefault();
  const btn = event.currentTarget;
  const li = btn.closest(".combatant");
  const c = this.combat.getCombatant(li.dataset.combatantId);

  // Switch control action
  switch (btn.dataset.control) {

    // Toggle combatant visibility
    case "toggleHidden":
      await this.combat.updateCombatant({_id: c._id, hidden: !c.hidden});
      break;

    // Toggle combatant defeated flag
    case "toggleDefeated":
      let isDefeated = !c.defeated;
      await this.combat.updateCombatant({_id: c._id, defeated: isDefeated});
      const token = canvas.tokens.get(c.tokenId);
      if ( token ) {
        if ( isDefeated && token.data.overlayEffect !== CONFIG.controlIcons.defeated ) token.toggleOverlay(CONFIG.controlIcons.defeated);
        else if ( !isDefeated && token.data.overlayEffect === CONFIG.controlIcons.defeated ) token.toggleOverlay(null);
      }
      break;

    // Roll combatant initiative
    case "rollInitiative":
      await this.combat.rollInitiative([c._id]);
      break;
  }

  // Render tracker updates
  this.render();  
}

Token.prototype._updateHealthOverlay = function(tok) {
  let maxHP = tok.actor.data.data.attributes.hp.max;
  let curHP = tok.actor.data.data.attributes.hp.value;
  let priorHealth = tok.data.overlayEffect;
  let newHealth = null;
  if ( curHP <= 0 ) {
    if ( priorHealth === "modules/conditions5e/icons/dead.svg" ) newHealth = priorHealth;
    else newHealth = "modules/conditions5e/icons/almostdead.svg";
  }
  else if ( curHP / maxHP < 0.5 ) newHealth = "modules/conditions5e/icons/wounded.svg";
  if ( newHealth !== priorHealth ) {
    if ( newHealth === null ) tok.toggleOverlay(priorHealth);
    else tok.toggleOverlay(newHealth);
  }
};

// This hook is required for Tokens NOT linked to an Actor
Hooks.on("updateToken", (scene, sceneID, update, tokenData, userId) => {
  let token = canvas.tokens.get(update._id);
  token._updateHealthOverlay(token);
});

// This hook is required for Tokens linked to an Actor
Hooks.on("updateActor", (entity, updated) => {
  entity.getActiveTokens(true).map(x => x._updateHealthOverlay(x));
});
