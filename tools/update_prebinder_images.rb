require "json"

DATA_FILE = File.expand_path("../data/product-category-details.json", __dir__)
PREFIX = "/assets/images/product-categories/stock"

SECTION_IMAGES = {
  "cable-assembly-01" => {
    "variants" => %W[#{PREFIX}/overmold-refresh/commons-molding-diagram.png #{PREFIX}/overmold-refresh/14920870.jpg #{PREFIX}/overmold-refresh/34718928.jpg #{PREFIX}/overmold-refresh/commons-purge-material.jpg #{PREFIX}/overmold-refresh/16544056.jpg #{PREFIX}/overmold-refresh/commons-clamping-unit.jpg],
    "materials" => %W[#{PREFIX}/overmold-refresh/commons-pellets.jpg #{PREFIX}/overmold-refresh/37363745.jpg #{PREFIX}/overmold-refresh/11048741.jpg #{PREFIX}/overmold-refresh/18469652.jpg],
    "solutions" => %W[#{PREFIX}/overmold-refresh/commons-machine-open.png #{PREFIX}/overmold-refresh/7480231.jpg #{PREFIX}/overmold-refresh/commons-robot-arm.jpg #{PREFIX}/overmold-refresh/9242906.jpg],
    "applications" => %W[#{PREFIX}/overmold-refresh/33427061.jpg #{PREFIX}/overmold-refresh/18471441.jpg #{PREFIX}/overmold-refresh/31741227.jpg #{PREFIX}/overmold-refresh/32588545.jpg #{PREFIX}/overmold-refresh/7869033.jpg #{PREFIX}/overmold-refresh/18471551.jpg],
    "process" => %W[#{PREFIX}/overmold-refresh/commons-moulding.png #{PREFIX}/overmold-refresh/commons-machine.png #{PREFIX}/overmold-refresh/33694031.jpg #{PREFIX}/overmold-refresh/32407077.jpg #{PREFIX}/overmold-refresh/17937676.jpg #{PREFIX}/overmold-refresh/11765539.jpg],
    "reliability" => %W[#{PREFIX}/overmold-refresh/37502090.jpg #{PREFIX}/overmold-refresh/19004429.jpg #{PREFIX}/overmold-refresh/16647824.jpg #{PREFIX}/overmold-refresh/33514501.jpg],
    "benefits" => %W[#{PREFIX}/overmold-refresh/28806603.jpg #{PREFIX}/overmold-refresh/34194565.jpg #{PREFIX}/overmold-refresh/14805033.jpg #{PREFIX}/overmold-refresh/13068887.jpg]
  },
  "custom-harness-12" => {
    "variants" => %W[#{PREFIX}/new-energy-refresh/33531823.jpg #{PREFIX}/new-energy-refresh/35138694.jpg #{PREFIX}/new-energy-refresh/33438229.jpg #{PREFIX}/new-energy-refresh/38264253.jpg #{PREFIX}/new-energy-refresh/9679179.jpg #{PREFIX}/new-energy-refresh/34054474.jpg],
    "materials" => %W[#{PREFIX}/new-energy-refresh/38171148.jpg #{PREFIX}/new-energy-refresh/33379360.jpg #{PREFIX}/new-energy-refresh/37576219.jpg #{PREFIX}/new-energy-refresh/14319099.jpg],
    "solutions" => %W[#{PREFIX}/new-energy-refresh/37029446.jpg #{PREFIX}/new-energy-refresh/35157346.jpg #{PREFIX}/new-energy-refresh/33531809.jpg #{PREFIX}/new-energy-refresh/9242264.jpg],
    "applications" => %W[#{PREFIX}/new-energy-refresh/9799999.jpg #{PREFIX}/new-energy-refresh/33508523.jpg #{PREFIX}/new-energy-refresh/33751679.jpg #{PREFIX}/new-energy-refresh/36085778.jpg #{PREFIX}/new-energy-refresh/4254161.jpg #{PREFIX}/new-energy-refresh/33708753.jpg],
    "process" => %W[#{PREFIX}/new-energy-refresh/33751638.jpg #{PREFIX}/new-energy-refresh/34132693.jpg #{PREFIX}/new-energy-refresh/36085816.jpg #{PREFIX}/new-energy-refresh/33751639.jpg #{PREFIX}/new-energy-refresh/2136243.jpg #{PREFIX}/new-energy-refresh/4254170.jpg],
    "reliability" => %W[#{PREFIX}/new-energy-refresh/30285845.jpg #{PREFIX}/new-energy-refresh/8853541.jpg #{PREFIX}/new-energy-refresh/39057094.jpg #{PREFIX}/new-energy-refresh/10699355.jpg],
    "benefits" => %W[#{PREFIX}/new-energy-refresh/35155421.jpg #{PREFIX}/new-energy-refresh/18555543.jpg #{PREFIX}/new-energy-refresh/8853508.jpg #{PREFIX}/new-energy-refresh/11645003.jpg]
  },
  "custom-harness-11" => {
    "variants" => %W[#{PREFIX}/waterproof-refresh/37293704.jpg #{PREFIX}/waterproof-design/cable-gland.jpg #{PREFIX}/waterproof-design/sealed-splice.jpg #{PREFIX}/waterproof-design/ip-rated-interface.jpg #{PREFIX}/waterproof-refresh/35000431.jpg #{PREFIX}/waterproof-design/condensation.jpg],
    "materials" => %W[#{PREFIX}/waterproof-design/o-rings.jpg #{PREFIX}/waterproof-design/heat-shrink.jpg #{PREFIX}/waterproof-refresh/24245332.jpg #{PREFIX}/waterproof-refresh/16584487.jpg],
    "solutions" => %W[#{PREFIX}/waterproof-refresh/459451.jpg #{PREFIX}/waterproof-refresh/12777073.jpg #{PREFIX}/waterproof-refresh/195184.jpg #{PREFIX}/waterproof-design/pressure-wash.jpg],
    "applications" => %W[#{PREFIX}/waterproof-refresh/38171111.jpg #{PREFIX}/waterproof-refresh/28663714.jpg #{PREFIX}/waterproof-refresh/18080739.jpg #{PREFIX}/waterproof-design/agriculture-wet.jpg #{PREFIX}/waterproof-design/marine-outboard.jpg #{PREFIX}/waterproof-refresh/7790672.jpg],
    "process" => %W[#{PREFIX}/waterproof-refresh/7535158.jpg #{PREFIX}/waterproof-design/resin-mixing.jpg #{PREFIX}/waterproof-refresh/8876714.jpg #{PREFIX}/waterproof-refresh/16408712.jpg #{PREFIX}/waterproof-refresh/6389386.jpg #{PREFIX}/waterproof-refresh/2877066.jpg],
    "reliability" => %W[#{PREFIX}/waterproof-refresh/14570124.jpg #{PREFIX}/waterproof-refresh/19504335.jpg #{PREFIX}/waterproof-refresh/36348537.jpg #{PREFIX}/waterproof-refresh/9314016.jpg],
    "benefits" => %W[#{PREFIX}/waterproof-design/hero-water-splash.jpg #{PREFIX}/waterproof-design/rain-droplets.jpg #{PREFIX}/waterproof-refresh/1076110.jpg #{PREFIX}/waterproof-refresh/34370966.jpg]
  },
  "custom-harness-10" => {
    "variants" => %W[#{PREFIX}/prototype-refresh/9242823.jpg #{PREFIX}/prototype-refresh/7166995.jpg #{PREFIX}/prototype-refresh/32391505.jpg #{PREFIX}/prototype-refresh/34221993.jpg #{PREFIX}/prototype-refresh/32391498.jpg #{PREFIX}/prototype-refresh/3912369.jpg],
    "materials" => %W[#{PREFIX}/prototype-refresh/35686433.jpg #{PREFIX}/prototype-refresh/34232878.jpg #{PREFIX}/prototype-refresh/37340074.jpg #{PREFIX}/prototype-refresh/2842456.jpg],
    "solutions" => %W[#{PREFIX}/prototype-refresh/3861946.jpg #{PREFIX}/prototype-refresh/33531809.jpg #{PREFIX}/prototype-refresh/36861981.jpg #{PREFIX}/prototype-refresh/30415869.jpg],
    "applications" => %W[#{PREFIX}/prototype-refresh/31121900.jpg #{PREFIX}/prototype-refresh/24859620.jpg #{PREFIX}/prototype-refresh/37492293.jpg #{PREFIX}/prototype-refresh/35155421.jpg #{PREFIX}/prototype-refresh/3913031.jpg #{PREFIX}/prototype-refresh/4485456.jpg],
    "process" => %W[#{PREFIX}/prototype-refresh/6263112.jpg #{PREFIX}/prototype-refresh/31090813.jpg #{PREFIX}/prototype-refresh/7286002.jpg #{PREFIX}/prototype-refresh/37340082.jpg #{PREFIX}/prototype-refresh/38264253.jpg #{PREFIX}/prototype-refresh/36003959.jpg],
    "reliability" => %W[#{PREFIX}/prototype-refresh/10699357.jpg #{PREFIX}/prototype-refresh/33531830.jpg #{PREFIX}/prototype-refresh/35157346.jpg #{PREFIX}/prototype-refresh/34054502.jpg],
    "benefits" => %W[#{PREFIX}/prototype-refresh/32391508.jpg #{PREFIX}/prototype-refresh/7018662.jpg #{PREFIX}/prototype-refresh/2136243.jpg #{PREFIX}/prototype-refresh/34908275.jpg]
  },
  "custom-harness-09" => {
    "variants" => %W[#{PREFIX}/braided-refresh/8246678.jpg #{PREFIX}/braided-refresh/13833648.jpg #{PREFIX}/braided-refresh/15546847.jpg #{PREFIX}/braided-refresh/136820.jpg #{PREFIX}/braided-refresh/4710334.jpg #{PREFIX}/braided-refresh-2/copper-braid-cable-03.jpg],
    "materials" => %W[#{PREFIX}/braided-refresh/36318911.jpg #{PREFIX}/braided-refresh/19326506.jpg #{PREFIX}/braided-refresh/12093450.jpg #{PREFIX}/braided-refresh/18660029.jpg],
    "solutions" => %W[#{PREFIX}/braided-refresh/16256696.jpg #{PREFIX}/braided-refresh/33053216.jpg #{PREFIX}/braided-refresh/31591460.jpg #{PREFIX}/braided-refresh/6634615.jpg],
    "applications" => %W[#{PREFIX}/braided-refresh/14331366.jpg #{PREFIX}/braided-refresh/19644395.jpg #{PREFIX}/braided-refresh/17061968.jpg #{PREFIX}/braided-refresh/5271312.jpg #{PREFIX}/braided-refresh/32979601.jpg #{PREFIX}/braided-refresh/5526309.jpg],
    "process" => %W[#{PREFIX}/braided-refresh/6634608.jpg #{PREFIX}/braided-refresh/4492087.jpg #{PREFIX}/braided-refresh/3794748.jpg #{PREFIX}/braided-refresh/37471991.jpg #{PREFIX}/braided-refresh/37218091.jpg #{PREFIX}/braided-refresh/13895319.jpg],
    "reliability" => %W[#{PREFIX}/braided-refresh/5908326.jpg #{PREFIX}/braided-refresh/4863034.jpg #{PREFIX}/braided-refresh/6630896.jpg #{PREFIX}/braided-refresh/3615706.jpg],
    "benefits" => %W[#{PREFIX}/braided-refresh/7533977.jpg #{PREFIX}/braided-refresh/16281313.jpg #{PREFIX}/braided-refresh/6630901.jpg #{PREFIX}/braided-refresh/35051182.jpg]
  },
  "custom-harness-08" => {
    "variants" => %W[#{PREFIX}/turnkey-refresh/34054482.jpg #{PREFIX}/turnkey-refresh/3862129.jpg #{PREFIX}/turnkey-refresh/38852436.jpg #{PREFIX}/turnkey-refresh/17937669.jpg #{PREFIX}/turnkey-refresh/30824327.jpg #{PREFIX}/turnkey-refresh/29224587.jpg],
    "materials" => %W[#{PREFIX}/turnkey-refresh/18540321.jpg #{PREFIX}/turnkey-refresh/13524778.jpg #{PREFIX}/turnkey-refresh/31259204.jpg /assets/images/factory/_MG_5473.jpg],
    "solutions" => %W[#{PREFIX}/turnkey-refresh/5324968.jpg #{PREFIX}/turnkey-refresh/4483942.jpg #{PREFIX}/turnkey-refresh/38136632.jpg /assets/images/factory/_MG_5474.jpg],
    "applications" => %W[#{PREFIX}/turnkey-refresh/11679687.jpg #{PREFIX}/turnkey-refresh/15947457.jpg #{PREFIX}/turnkey-refresh/5953770.jpg #{PREFIX}/turnkey-refresh/31091547.jpg #{PREFIX}/turnkey-refresh/27793715.jpg #{PREFIX}/turnkey-refresh/18468444.jpg],
    "process" => %W[#{PREFIX}/turnkey-refresh/4484151.jpg #{PREFIX}/turnkey-refresh/4483941.jpg #{PREFIX}/turnkey-refresh/4484154.jpg #{PREFIX}/turnkey-refresh/31112250.jpg /assets/images/factory/_MG_5478.jpg /assets/images/factory/_MG_5480.jpg],
    "reliability" => %W[#{PREFIX}/turnkey-refresh/17260158.jpg #{PREFIX}/turnkey-refresh/4440839.jpg #{PREFIX}/turnkey-refresh/12418936.jpg #{PREFIX}/turnkey-refresh/31856778.jpg],
    "benefits" => %W[#{PREFIX}/turnkey-refresh/36771186.jpg #{PREFIX}/turnkey-refresh/34585120.jpg #{PREFIX}/turnkey-refresh/7464201.jpg #{PREFIX}/turnkey-refresh/5775099.jpg]
  },
  "custom-harness-07" => {
    "variants" => %W[#{PREFIX}/pigtail-refresh-2/connector-pigtails.jpg #{PREFIX}/pigtail-refresh/7286937.jpg #{PREFIX}/pigtail-refresh/3616772.jpg #{PREFIX}/pigtail-refresh/11404176.jpg #{PREFIX}/solar/branch-flying-leads.jpg #{PREFIX}/pigtail-refresh/11837458.jpg],
    "materials" => %W[#{PREFIX}/pigtail-refresh/29852999.jpg #{PREFIX}/pigtail-refresh/14319099.jpg #{PREFIX}/pigtail-refresh/8132431.jpg #{PREFIX}/pigtail-refresh/36449414.jpg],
    "solutions" => %W[#{PREFIX}/pigtail-refresh/13065692.jpg #{PREFIX}/pigtail-refresh/4116193.jpg #{PREFIX}/pigtail-refresh/5572271.jpg #{PREFIX}/pigtail-refresh/6870313.jpg],
    "applications" => %W[#{PREFIX}/pigtail-refresh/10290624.jpg #{PREFIX}/pigtail-refresh/8986041.jpg #{PREFIX}/pigtail-refresh/10290629.jpg #{PREFIX}/pigtail-refresh/5572265.jpg #{PREFIX}/pigtail-refresh/36311187.jpg #{PREFIX}/pigtail-refresh/5562431.jpg],
    "process" => %W[#{PREFIX}/pigtail-refresh/36194581.jpg #{PREFIX}/pigtail-refresh/8470688.jpg #{PREFIX}/pigtail-refresh/19895784.jpg #{PREFIX}/pigtail-refresh/34404298.jpg #{PREFIX}/pigtail-refresh/33118660.jpg #{PREFIX}/pigtail-refresh/36327501.jpg],
    "reliability" => %W[#{PREFIX}/pigtail-refresh/4792515.jpg #{PREFIX}/pigtail-refresh/7286026.jpg #{PREFIX}/pigtail-refresh/34404164.jpg #{PREFIX}/pigtail-refresh/4449796.jpg],
    "benefits" => %W[#{PREFIX}/pigtail-refresh/10699351.jpg #{PREFIX}/pigtail-refresh/9242820.jpg #{PREFIX}/pigtail-refresh/29491360.jpg #{PREFIX}/ecu-dcu/breakout-branches.jpg]
  },
  "custom-harness-06" => {
    "variants" => %W[#{PREFIX}/jumper-refresh/2332885.jpg #{PREFIX}/jumper-refresh/34956927.jpg #{PREFIX}/jumper-refresh/4792713.jpg #{PREFIX}/jumper-refresh/33168016.jpg #{PREFIX}/jumper-refresh/33813265.jpg #{PREFIX}/jumper-refresh/28785438.jpg],
    "materials" => %W[#{PREFIX}/jumper-refresh/12266915.jpg #{PREFIX}/jumper-refresh/6636458.jpg #{PREFIX}/jumper-refresh/34924858.jpg #{PREFIX}/jumper-refresh/4330788.jpg],
    "solutions" => %W[#{PREFIX}/jumper-refresh/6755059.jpg #{PREFIX}/jumper-refresh/15470540.jpg #{PREFIX}/jumper-refresh/11447064.jpg #{PREFIX}/jumper-refresh/33020762.jpg],
    "applications" => %W[#{PREFIX}/jumper-refresh/35673090.jpg #{PREFIX}/jumper-refresh/33694034.jpg #{PREFIX}/jumper-refresh/5023565.jpg #{PREFIX}/jumper-refresh/38744674.jpg #{PREFIX}/jumper-refresh/7639429.jpg #{PREFIX}/jumper-refresh-2/configuration-jumper.jpg],
    "process" => %W[#{PREFIX}/jumper-refresh/12078533.jpg #{PREFIX}/jumper-refresh/14887613.jpg #{PREFIX}/jumper-refresh/10699354.jpg #{PREFIX}/jumper-refresh/38264254.jpg #{PREFIX}/jumper-refresh/7639432.jpg #{PREFIX}/jumper-refresh/31995010.jpg],
    "reliability" => %W[#{PREFIX}/jumper-refresh/6726749.jpg #{PREFIX}/jumper-refresh/4398314.jpg #{PREFIX}/jumper-refresh/33384330.jpg #{PREFIX}/jumper-refresh/2182863.jpg],
    "benefits" => %W[#{PREFIX}/jumper-refresh/35048338.jpg #{PREFIX}/jumper-refresh/35652420.jpg #{PREFIX}/jumper-refresh/35673080.jpg #{PREFIX}/jumper-refresh/32396935.jpg]
  },
  "custom-harness-01" => {
    "variants" => %W[#{PREFIX}/industrial-equipment-refresh-2/34526423.jpg #{PREFIX}/industrial-equipment-refresh-2/35652459.jpg #{PREFIX}/industrial-equipment-refresh-2/35652334.jpg #{PREFIX}/industrial-equipment-refresh-2/28752021.jpg #{PREFIX}/industrial-equipment-refresh-2/33706868.jpg #{PREFIX}/industrial-equipment/cnc-machine.jpg],
    "materials" => %W[#{PREFIX}/industrial-equipment-refresh-2/5279317.jpg #{PREFIX}/industrial-equipment-refresh-2/28286031.jpg #{PREFIX}/industrial-equipment-refresh-2/shielded-cable-commons.jpg #{PREFIX}/industrial-equipment-refresh-2/crimp-terminals-commons.jpg],
    "solutions" => %W[#{PREFIX}/industrial-equipment-refresh/engineering-blueprint.jpg #{PREFIX}/industrial-equipment-refresh-2/33388408.jpg #{PREFIX}/industrial-equipment-refresh/material-organization.jpg #{PREFIX}/industrial-equipment-refresh/factory-release.jpg],
    "applications" => %W[#{PREFIX}/industrial-equipment-refresh/automation-controls.jpg #{PREFIX}/industrial-equipment-refresh-2/9242202.jpg #{PREFIX}/industrial-equipment-refresh-2/36423801.jpg #{PREFIX}/industrial-equipment-refresh/warehouse-automation.jpg #{PREFIX}/industrial-equipment-refresh-2/38217230.jpg #{PREFIX}/industrial-equipment-refresh-2/10871929.jpg],
    "process" => %W[#{PREFIX}/industrial-equipment-refresh-2/39174676.jpg #{PREFIX}/industrial-equipment-refresh-2/7480232.jpg #{PREFIX}/industrial-equipment-refresh-2/29596327.jpg #{PREFIX}/industrial-equipment-refresh-2/35652464.jpg #{PREFIX}/industrial-equipment-refresh/electrical-validation.jpg #{PREFIX}/industrial-equipment-refresh/cnc-production.jpg],
    "reliability" => %W[#{PREFIX}/industrial-equipment-refresh-2/8956313.jpg #{PREFIX}/industrial-equipment-refresh-2/35652336.jpg #{PREFIX}/industrial-equipment-refresh-2/36423812.jpg #{PREFIX}/industrial-equipment-refresh/interface-electronics.jpg],
    "benefits" => %W[#{PREFIX}/industrial-equipment-refresh/equipment-maintenance.jpg #{PREFIX}/industrial-equipment-refresh-2/31580848.jpg #{PREFIX}/industrial-equipment-refresh/production-quality.jpg #{PREFIX}/industrial-equipment-refresh-2/32048366.jpg]
  },
  "custom-harness-03" => {
    "variants" => %W[#{PREFIX}/robotic/yellow-robot-arm.jpg #{PREFIX}/robotic/delta-robot.jpg #{PREFIX}/robotic/robotic-welding.jpg #{PREFIX}/robotic-refresh-2/baxter-gripper.jpg #{PREFIX}/robotic/factory-conveyor.jpg #{PREFIX}/robotic/robot-lab.jpg],
    "materials" => %W[#{PREFIX}/robotic-refresh-2/stranded-copper-wire.jpg #{PREFIX}/robotic-refresh-2/cable-drag-chain-metal.jpg #{PREFIX}/robotic-refresh-2/shielded-cable-cross-section.jpg #{PREFIX}/robotic-refresh-2/industrial-strain-relief-rail.jpg],
    "solutions" => %W[#{PREFIX}/robotic/robot-assembly-team.jpg #{PREFIX}/robotic-refresh/robotic-lab-arm.jpg #{PREFIX}/robotic-refresh-2/ur5e-modular-arm.jpg #{PREFIX}/robotic-refresh/robot-engineering-team.jpg],
    "applications" => %W[#{PREFIX}/robotic-refresh/vehicle-robot-assembly.jpg #{PREFIX}/robotic-refresh/robotic-welding-blue.jpg #{PREFIX}/robotic-refresh/automated-conveyor.jpg #{PREFIX}/robotic-refresh/research-robot-arm.jpg #{PREFIX}/robotic-refresh/modern-robot-arm.jpg #{PREFIX}/robotic-refresh/cnc-automation.jpg],
    "process" => %W[#{PREFIX}/robotic-refresh/robotic-factory-controls.jpg #{PREFIX}/robotic-refresh/robot-joint-detail.jpg #{PREFIX}/robotic-refresh/industrial-cables.jpg #{PREFIX}/robotic-refresh-2/7868884.jpg #{PREFIX}/robotic-refresh-2/6349399.jpg #{PREFIX}/robotic-refresh/factory-robotics.jpg],
    "reliability" => %W[#{PREFIX}/robotic-refresh/robot-equipment-detail.jpg #{PREFIX}/robotic-refresh/robotic-device.jpg #{PREFIX}/robotic-refresh/industrial-power-connector.jpg #{PREFIX}/robotic-refresh/electrical-validation.jpg],
    "benefits" => %W[#{PREFIX}/robotic-refresh/robotic-welding-cell.jpg #{PREFIX}/robotic-refresh/equipment-maintenance.jpg #{PREFIX}/robotic-refresh/cnc-tooling.jpg #{PREFIX}/robotic-refresh/robotic-grinding.jpg]
  },
  "custom-harness-04" => {
    "variants" => %W[#{PREFIX}/industrial-equipment/test-measurement.jpg #{PREFIX}/instrument-refresh-2/thermocouple-probe.jpg #{PREFIX}/industrial-equipment/pcb-inspection.jpg #{PREFIX}/industrial-equipment/sealed-connector.jpg #{PREFIX}/industrial-equipment/control-panel.jpg #{PREFIX}/industrial-equipment/automation-lab.jpg],
    "materials" => %W[#{PREFIX}/instrument-refresh-2/twisted-pair-conductors.jpg #{PREFIX}/instrument-refresh/shielded-signal-path.jpg #{PREFIX}/industrial-equipment/cable-insulation.jpg #{PREFIX}/instrument-refresh-2/industrial-sensor-connectors.jpg],
    "solutions" => %W[#{PREFIX}/industrial-equipment/electrician-review.jpg #{PREFIX}/instrument-refresh-2/connector-interface-assortment.jpg #{PREFIX}/industrial-equipment/panel-testing.jpg #{PREFIX}/industrial-equipment/component-bins.jpg],
    "applications" => %W[#{PREFIX}/instrument-refresh/oscilloscope-lab.jpg #{PREFIX}/instrument-refresh-2/automatic-packing-station.jpg #{PREFIX}/instrument-refresh-2/water-treatment-level-sensor.jpg #{PREFIX}/industrial-equipment/cnc-operation.jpg #{PREFIX}/instrument-refresh/instrument-technician.jpg #{PREFIX}/industrial-equipment/factory-robot.jpg],
    "process" => %W[#{PREFIX}/instrument-refresh/precision-measurement.jpg #{PREFIX}/instrument-refresh/dimensional-definition.jpg #{PREFIX}/instrument-refresh/process-gauges.jpg #{PREFIX}/instrument-refresh-2/first-article-wiring-check.jpg #{PREFIX}/instrument-refresh/signal-oscilloscope.jpg #{PREFIX}/instrument-refresh/pressure-instrumentation.jpg],
    "reliability" => %W[#{PREFIX}/instrument-refresh/industrial-meter.jpg #{PREFIX}/instrument-refresh/process-equipment.jpg #{PREFIX}/industrial-equipment/reliability-temperature.jpg #{PREFIX}/instrument-refresh-2/vibration-sensor-module.jpg],
    "benefits" => %W[#{PREFIX}/instrument-refresh/system-gauge.jpg #{PREFIX}/instrument-refresh-2/instrumentation-maintenance.jpg #{PREFIX}/instrument-refresh-2/data-acquisition-system.jpg #{PREFIX}/instrument-refresh/instrument-maintenance.jpg]
  },
  "custom-harness-05" => {
    "variants" => %W[#{PREFIX}/appliance/circuit-board-technician.jpg #{PREFIX}/appliance/heating-element.jpg #{PREFIX}/appliance/electric-motor.jpg #{PREFIX}/appliance/appliance-technician.jpg #{PREFIX}/appliance/pcb-repair.jpg #{PREFIX}/appliance-refresh-2/internal-appliance-harness.jpg],
    "materials" => %W[#{PREFIX}/appliance-refresh-2/copper-conductors.jpg #{PREFIX}/appliance-refresh/heated-cooking.jpg #{PREFIX}/appliance-refresh-2/faston-terminals.jpg #{PREFIX}/appliance-refresh/circuit-board-service.jpg],
    "solutions" => %W[#{PREFIX}/appliance-refresh/electronics-training.jpg #{PREFIX}/appliance-refresh/aircon-workshop.jpg #{PREFIX}/appliance-refresh/commercial-kitchen.jpg #{PREFIX}/appliance-refresh-2/electronic-components.jpg],
    "applications" => %W[#{PREFIX}/appliance-refresh/commercial-oven.jpg #{PREFIX}/appliance-refresh/cooling-maintenance.jpg #{PREFIX}/appliance-refresh/outdoor-hvac.jpg #{PREFIX}/appliance-refresh-2/drink-dispenser-interior.jpg #{PREFIX}/appliance-refresh-2/vending-machine-interior.jpg #{PREFIX}/appliance-refresh/domestic-appliances.jpg],
    "process" => %W[#{PREFIX}/appliance-refresh/equipment-layout.jpg #{PREFIX}/appliance-refresh/stainless-kitchen.jpg #{PREFIX}/appliance-refresh/aircon-repair.jpg #{PREFIX}/appliance-refresh-2/crimping-three-steps.jpg #{PREFIX}/appliance-refresh/hvac-controls.jpg #{PREFIX}/appliance-refresh-2/air-conditioner-assembly-line.jpg],
    "reliability" => %W[#{PREFIX}/appliance-refresh/oven-operation.jpg #{PREFIX}/appliance-refresh/restaurant-kitchen.jpg #{PREFIX}/appliance-refresh-2/mains-strain-relief.jpg #{PREFIX}/appliance-refresh/professional-cooking.jpg],
    "benefits" => %W[#{PREFIX}/appliance-refresh/kitchen-preparation.jpg #{PREFIX}/appliance-refresh-2/washing-machine-repair.jpg #{PREFIX}/appliance-refresh/pizza-oven-line.jpg #{PREFIX}/appliance-refresh/water-pump-service.jpg]
  },
  "custom-harness-02" => {
    "variants" => %W[#{PREFIX}/control-panel/breaker-adjustment.jpg #{PREFIX}/control-panel-refresh/automation-system.jpg #{PREFIX}/control-panel-refresh/switchgear-detail.jpg #{PREFIX}/control-panel/panel-technician.jpg #{PREFIX}/control-panel/industrial-electrician.jpg #{PREFIX}/control-panel-refresh/cable-lug-tools.jpg],
    "materials" => %W[#{PREFIX}/control-panel-refresh/color-coded-wiring.jpg #{PREFIX}/control-panel-refresh/open-switchbox.jpg #{PREFIX}/control-panel/labeled-fuse-box.jpg #{PREFIX}/control-panel-refresh-2/7720705.jpg],
    "solutions" => %W[#{PREFIX}/control-panel-refresh/blueprint-laptop.jpg #{PREFIX}/control-panel-refresh/electrical-workshop.jpg #{PREFIX}/control-panel/panel-mechanical-assembly.jpg #{PREFIX}/control-panel-refresh/helmet-panel-inspection.jpg],
    "applications" => %W[#{PREFIX}/control-panel-refresh/control-room.jpg #{PREFIX}/control-panel-refresh/packaging-line.jpg #{PREFIX}/control-panel-refresh/outdoor-power-cabinet.jpg #{PREFIX}/control-panel-refresh/industrial-robot-detail.jpg #{PREFIX}/control-panel/utility-panel-worker.jpg #{PREFIX}/control-panel-refresh/electronic-control-unit.jpg],
    "process" => %W[#{PREFIX}/control-panel/panel-inspection-tablet.jpg #{PREFIX}/control-panel-refresh-2/26100225.jpg #{PREFIX}/control-panel-refresh-2/6349408.jpg #{PREFIX}/control-panel-refresh/breaker-technician.jpg #{PREFIX}/control-panel-refresh/field-panel-work.jpg #{PREFIX}/control-panel/panel-multimeter-test.jpg],
    "reliability" => %W[#{PREFIX}/control-panel/voltage-test.jpg #{PREFIX}/control-panel-refresh/labeled-control-panel.jpg #{PREFIX}/control-panel-refresh/electronic-components.jpg #{PREFIX}/control-panel/fuse-box-inspection.jpg],
    "benefits" => %W[#{PREFIX}/control-panel-refresh/electrician-team.jpg #{PREFIX}/control-panel-refresh-2/32845663.jpg #{PREFIX}/control-panel-refresh/machine-control-operation.jpg #{PREFIX}/control-panel-refresh/panel-wire-adjustment.jpg]
  }
}.freeze

CONTROL_PANEL_IMAGES = {
  "hero" => "#{PREFIX}/control-panel/circuit-breaker-panel.jpg",
  "range" => "#{PREFIX}/control-panel/breaker-wiring-closeup.jpg",
  "variants" => "#{PREFIX}/industrial-equipment/control-panel.jpg",
  "materials" => "#{PREFIX}/industrial-equipment/copper-wire.jpg",
  "applications" => "#{PREFIX}/control-panel/industrial-electrician.jpg",
  "process" => "#{PREFIX}/control-panel/panel-mechanical-assembly.jpg",
  "testing" => "#{PREFIX}/control-panel/panel-multimeter-test.jpg",
  "company" => "/assets/images/factory/factory-floor-polished.jpg"
}.freeze

NEW_ENERGY_IMAGES = {
  "hero" => "#{PREFIX}/new-energy-refresh/10800215.jpg",
  "range" => "#{PREFIX}/new-energy-refresh/12737898.jpg"
}.freeze

OVERMOLD_IMAGES = {
  "hero" => "#{PREFIX}/overmold-refresh/overmold-hero-ai.png",
  "range" => "#{PREFIX}/overmold-refresh/overmold-range-ai.png"
}.freeze

JUMPER_IMAGES = {
  "hero" => "#{PREFIX}/jumper-refresh-2/jumper-board-hero.jpg",
  "range" => "#{PREFIX}/jumper-refresh-2/splicing-connector-wire.jpg"
}.freeze

PIGTAIL_IMAGES = {
  "hero" => "#{PREFIX}/pigtail-refresh/11392632.jpg",
  "range" => "#{PREFIX}/pigtail-refresh-2/instrument-branch-harness.jpg"
}.freeze

TURNKEY_IMAGES = {
  "hero" => "#{PREFIX}/turnkey-refresh-2/electronics-assembly-worker.jpg",
  "range" => "#{PREFIX}/turnkey-refresh-2/electronics-quality-check.jpg"
}.freeze

BRAIDED_IMAGES = {
  "hero" => "#{PREFIX}/braided-refresh/3921633.jpg",
  "range" => "#{PREFIX}/braided-refresh-2/braid-foil-shielded-cable.jpg"
}.freeze

document = File.read(DATA_FILE)
data = JSON.parse(document)

def category_bounds(document, category_key)
  start_at = document.index(/^  #{Regexp.escape(JSON.generate(category_key))}: \{/)
  raise "missing category #{category_key}" unless start_at
  finish_at = document.index(/^  "[^"]+": \{/, start_at + category_key.length + 8) || document.length
  [start_at, finish_at]
end

def replace_item_image!(document, category_key, title_zh, new_image)
  start_at, finish_at = category_bounds(document, category_key)
  category = document[start_at...finish_at]
  title_at = category.index(JSON.generate(title_zh))
  raise "missing title #{category_key}: #{title_zh}" unless title_at
  line_start = (category.rindex("\n", title_at) || -1) + 1
  line_end = category.index("\n", title_at) || category.length
  line = category[line_start...line_end]
  return if line.include?(JSON.generate(new_image))
  changed = line.sub(/"image"\s*:\s*"[^"]+"/, %Q{"image": #{JSON.generate(new_image)}})
  raise "could not replace #{category_key}: #{title_zh}" if changed == line
  document[start_at + line_start, line.length] = changed
end

SECTION_IMAGES.each do |category_key, sections|
  page = data.fetch(category_key).fetch("page")
  sections.each do |section_key, images|
    items = page.fetch(section_key)
    raise "#{category_key}.#{section_key} count mismatch" unless items.length == images.length
    items.zip(images).each { |item, image| replace_item_image!(document, category_key, item.fetch("title").fetch("zh"), image) }
  end
end

start_at, finish_at = category_bounds(document, "custom-harness-02")
category = document[start_at...finish_at]
images_start = category.index(/^      "images": \{/)
images_end = category.index(/^      \},/, images_start) + 8
images_block = category[images_start...images_end]
CONTROL_PANEL_IMAGES.each do |key, value|
  images_block.sub!(/"#{Regexp.escape(key)}"\s*:\s*"[^"]+"/, %Q{"#{key}": #{JSON.generate(value)}})
end
document[start_at + images_start, images_end - images_start] = images_block

start_at, finish_at = category_bounds(document, "cable-assembly-01")
category = document[start_at...finish_at]
images_start = category.index(/^      "images":\{/)
images_end = category.index("\n", images_start)
images_block = category[images_start...images_end]
OVERMOLD_IMAGES.each do |key, value|
  images_block.sub!(/"#{Regexp.escape(key)}"\s*:\s*"[^"]+"/, %Q{"#{key}":#{JSON.generate(value)}})
end
document[start_at + images_start, images_end - images_start] = images_block

start_at, finish_at = category_bounds(document, "custom-harness-12")
category = document[start_at...finish_at]
images_start = category.index(/^      "images":\{/)
images_end = category.index("\n", images_start)
images_block = category[images_start...images_end]
NEW_ENERGY_IMAGES.each do |key, value|
  images_block.sub!(/"#{Regexp.escape(key)}"\s*:\s*"[^"]+"/, %Q{"#{key}":#{JSON.generate(value)}})
end
document[start_at + images_start, images_end - images_start] = images_block

start_at, finish_at = category_bounds(document, "custom-harness-06")
category = document[start_at...finish_at]
images_start = category.index(/^      "images": \{/)
images_end = category.index(/^      \},/, images_start) + 8
images_block = category[images_start...images_end]
JUMPER_IMAGES.each do |key, value|
  images_block.sub!(/"#{Regexp.escape(key)}"\s*:\s*"[^"]+"/, %Q{"#{key}": #{JSON.generate(value)}})
end
document[start_at + images_start, images_end - images_start] = images_block

start_at, finish_at = category_bounds(document, "custom-harness-07")
category = document[start_at...finish_at]
images_start = category.index(/^      "images":\{/)
images_end = category.index("\n", images_start)
images_block = category[images_start...images_end]
PIGTAIL_IMAGES.each do |key, value|
  images_block.sub!(/"#{Regexp.escape(key)}"\s*:\s*"[^"]+"/, %Q{"#{key}":#{JSON.generate(value)}})
end
document[start_at + images_start, images_end - images_start] = images_block

start_at, finish_at = category_bounds(document, "custom-harness-08")
category = document[start_at...finish_at]
images_start = category.index(/^      "images":\{/)
images_end = category.index("\n", images_start)
images_block = category[images_start...images_end]
TURNKEY_IMAGES.each do |key, value|
  images_block.sub!(/"#{Regexp.escape(key)}"\s*:\s*"[^"]+"/, %Q{"#{key}":#{JSON.generate(value)}})
end
document[start_at + images_start, images_end - images_start] = images_block

start_at, finish_at = category_bounds(document, "custom-harness-09")
category = document[start_at...finish_at]
images_start = category.index(/^      "images":\{/)
images_end = category.index("\n", images_start)
images_block = category[images_start...images_end]
BRAIDED_IMAGES.each do |key, value|
  images_block.sub!(/"#{Regexp.escape(key)}"\s*:\s*"[^"]+"/, %Q{"#{key}":#{JSON.generate(value)}})
end
document[start_at + images_start, images_end - images_start] = images_block

File.write(DATA_FILE, document)
puts "Updated #{SECTION_IMAGES.length} categories in #{DATA_FILE}"
