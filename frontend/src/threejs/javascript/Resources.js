import * as THREE from 'three'

import Loader from './Utils/Loader.js'
import EventEmitter from './Utils/EventEmitter.js'

export default class Resources extends EventEmitter
{
    constructor()
    {
        super()

        this.loader = new Loader()
        this.items = {}

        this.loader.load([
            // Matcaps
            { name: 'matcapBeige', source: '/static/models/matcaps/beige.png', type: 'texture' },
            { name: 'matcapBlack', source: '/static/models/matcaps/black.png', type: 'texture' },
            { name: 'matcapOrange', source: '/static/models/matcaps/orange.png', type: 'texture' },
            { name: 'matcapRed', source: '/static/models/matcaps/red.png', type: 'texture' },
            { name: 'matcapWhite', source: '/static/models/matcaps/white.png', type: 'texture' },
            { name: 'matcapGreen', source: '/static/models/matcaps/green.png', type: 'texture' },
            { name: 'matcapBrown', source: '/static/models/matcaps/brown.png', type: 'texture' },
            { name: 'matcapGray', source: '/static/models/matcaps/gray.png', type: 'texture' },
            { name: 'matcapEmeraldGreen', source: '/static/models/matcaps/emeraldGreen.png', type: 'texture' },
            { name: 'matcapPurple', source: '/static/models/matcaps/purple.png', type: 'texture' },
            { name: 'matcapBlue', source: '/static/models/matcaps/blue.png', type: 'texture' },
            { name: 'matcapYellow', source: '/static/models/matcaps/yellow.png', type: 'texture' },
            { name: 'matcapMetal', source: '/static/models/matcaps/metal.png', type: 'texture' },
            // { name: 'matcapGold', source: '/static/models/matcaps/gold.png', type: 'texture' },

            // Intro
            { name: 'introStaticBase', source: '/static/models/intro/static/base.glb' },
            { name: 'introStaticCollision', source: '/static/models/intro/static/collision.glb' },
            { name: 'introStaticFloorShadow', source: '/static/models/intro/static/floorShadow.png', type: 'texture' },

            { name: 'introInstructionsLabels', source: '/static/models/intro/instructions/labels.glb' },
            { name: 'introInstructionsArrows', source: '/static/models/intro/instructions/arrows.png', type: 'texture' },
            { name: 'introInstructionsControls', source: '/static/models/intro/instructions/controls.png', type: 'texture' },
            { name: 'introInstructionsOther', source: '/static/models/intro/instructions/other.png', type: 'texture' },

            { name: 'introArrowKeyBase', source: '/static/models/intro/arrowKey/base.glb' },
            { name: 'introArrowKeyCollision', source: '/static/models/intro/arrowKey/collision.glb' },

            { name: 'introBBase', source: '/static/models/intro/b/base.glb' },
            { name: 'introBCollision', source: '/static/models/intro/b/collision.glb' },

            { name: 'introRBase', source: '/static/models/intro/r/base.glb' },
            { name: 'introRCollision', source: '/static/models/intro/r/collision.glb' },

            { name: 'introUBase', source: '/static/models/intro/u/base.glb' },
            { name: 'introUCollision', source: '/static/models/intro/u/collision.glb' },

            { name: 'introNBase', source: '/static/models/intro/n/base.glb' },
            { name: 'introNCollision', source: '/static/models/intro/n/collision.glb' },

            { name: 'introOBase', source: '/static/models/intro/o/base.glb' },
            { name: 'introOCollision', source: '/static/models/intro/o/collision.glb' },

            { name: 'introSBase', source: '/static/models/intro/s/base.glb' },
            { name: 'introSCollision', source: '/static/models/intro/s/collision.glb' },

            { name: 'introIBase', source: '/static/models/intro/i/base.glb' },
            { name: 'introICollision', source: '/static/models/intro/i/collision.glb' },

            { name: 'introMBase', source: '/static/models/intro/m/base.glb' },
            { name: 'introMCollision', source: '/static/models/intro/m/collision.glb' },

            { name: 'introCreativeBase', source: '/static/models/intro/creative/base.glb' },
            { name: 'introCreativeCollision', source: '/static/models/intro/creative/collision.glb' },

            { name: 'introDevBase', source: '/static/models/intro/dev/base.glb' },
            { name: 'introDevCollision', source: '/static/models/intro/dev/collision.glb' },

            // Intro
            { name: 'crossroadsStaticBase', source: '/static/models/crossroads/static/base.glb' },
            { name: 'crossroadsStaticCollision', source: '/static/models/crossroads/static/collision.glb' },
            { name: 'crossroadsStaticFloorShadow', source: '/static/models/crossroads/static/floorShadow.png', type: 'texture' },

            // Car default
            { name: 'carDefaultChassis', source: '/static/models/car/default/chassis.glb' },
            { name: 'carDefaultWheel', source: '/static/models/car/default/wheel.glb' },
            { name: 'carDefaultBackLightsBrake', source: '/static/models/car/default/backLightsBrake.glb' },
            { name: 'carDefaultBackLightsReverse', source: '/static/models/car/default/backLightsReverse.glb' },
            { name: 'carDefaultAntena', source: '/static/models/car/default/antena.glb' },
            // { name: 'carDefaultBunnyEarLeft', source: '/static/models/car/default/bunnyEarLeft.glb' },
            // { name: 'carDefaultBunnyEarRight', source: '/static/models/car/default/bunnyEarRight.glb' },

            // Car default
            { name: 'carCyberTruckChassis', source: '/static/models/car/cyberTruck/chassis.glb' },
            { name: 'carCyberTruckWheel', source: '/static/models/car/cyberTruck/wheel.glb' },
            { name: 'carCyberTruckBackLightsBrake', source: '/static/models/car/cyberTruck/backLightsBrake.glb' },
            { name: 'carCyberTruckBackLightsReverse', source: '/static/models/car/cyberTruck/backLightsReverse.glb' },
            { name: 'carCyberTruckAntena', source: '/static/models/car/cyberTruck/antena.glb' },

            // Project
            { name: 'projectsBoardStructure', source: '/static/models/projects/board/structure.glb' },
            { name: 'projectsBoardCollision', source: '/static/models/projects/board/collision.glb' },
            { name: 'projectsBoardStructureFloorShadow', source: '/static/models/projects/board/floorShadow.png', type: 'texture' },
            { name: 'projectsBoardPlane', source: '/static/models/projects/board/plane.glb' },

            { name: 'projectsDistinctionsAwwwardsBase', source: '/static/models/projects/distinctions/awwwards/base.glb' },
            { name: 'projectsDistinctionsAwwwardsCollision', source: '/static/models/projects/distinctions/awwwards/collision.glb' },
            { name: 'projectsDistinctionsFWABase', source: '/static/models/projects/distinctions/fwa/base.glb' },
            { name: 'projectsDistinctionsFWACollision', source: '/static/models/projects/distinctions/fwa/collision.glb' },
            { name: 'projectsDistinctionsCSSDABase', source: '/static/models/projects/distinctions/cssda/base.glb' },
            { name: 'projectsDistinctionsCSSDACollision', source: '/static/models/projects/distinctions/cssda/collision.glb' },

            { name: 'projectsLuniFloor', source: '/static/models/projects/luni/floorTexture.webp', type: 'texture' },
            { name: 'projectsBonhomme10ansFloor', source: '/static/models/projects/bonhomme10ans/floorTexture.webp', type: 'texture' },
            { name: 'projectsThreejsJourneyFloor', source: '/static/models/projects/threejsJourney/floorTexture.webp', type: 'texture' },
            { name: 'projectsMadboxFloor', source: '/static/models/projects/madbox/floorTexture.png', type: 'texture' },
            { name: 'projectsScoutFloor', source: '/static/models/projects/scout/floorTexture.png', type: 'texture' },
            { name: 'projectsChartogneFloor', source: '/static/models/projects/chartogne/floorTexture.png', type: 'texture' },
            // { name: 'projectsZenlyFloor', source: '/static/models/projects/zenly/floorTexture.png', type: 'texture' },
            { name: 'projectsCitrixRedbullFloor', source: '/static/models/projects/citrixRedbull/floorTexture.png', type: 'texture' },
            { name: 'projectsPriorHoldingsFloor', source: '/static/models/projects/priorHoldings/floorTexture.png', type: 'texture' },
            { name: 'projectsOranoFloor', source: '/static/models/projects/orano/floorTexture.png', type: 'texture' },
            // { name: 'projectsGleecChatFloor', source: '/static/models/projects/gleecChat/floorTexture.png', type: 'texture' },
            // { name: 'projectsKepplerFloor', source: '/static/models/projects/keppler/floorTexture.png', type: 'texture' },

            // Information
            { name: 'informationStaticBase', source: '/static/models/information/static/base.glb' },
            { name: 'informationStaticCollision', source: '/static/models/information/static/collision.glb' },
            { name: 'informationStaticFloorShadow', source: '/static/models/information/static/floorShadow.png', type: 'texture' },

            { name: 'informationBaguetteBase', source: '/static/models/information/baguette/base.glb' },
            { name: 'informationBaguetteCollision', source: '/static/models/information/baguette/collision.glb' },

            { name: 'informationContactTwitterLabel', source: '/static/models/information/static/contactTwitterLabel.png', type: 'texture' },
            { name: 'informationContactGithubLabel', source: '/static/models/information/static/contactGithubLabel.png', type: 'texture' },
            { name: 'informationContactLinkedinLabel', source: '/static/models/information/static/contactLinkedinLabel.png', type: 'texture' },
            { name: 'informationContactMailLabel', source: '/static/models/information/static/contactMailLabel.png', type: 'texture' },

            { name: 'informationActivities', source: '/static/models/information/static/activities.png', type: 'texture' },

            // Playground
            { name: 'playgroundStaticBase', source: '/static/models/playground/static/base.glb' },
            { name: 'playgroundStaticCollision', source: '/static/models/playground/static/collision.glb' },
            { name: 'playgroundStaticFloorShadow', source: '/static/models/playground/static/floorShadow.png', type: 'texture' },

            // Brick
            { name: 'brickBase', source: '/static/models/brick/base.glb' },
            { name: 'brickCollision', source: '/static/models/brick/collision.glb' },

            // Horn
            { name: 'hornBase', source: '/static/models/horn/base.glb' },
            { name: 'hornCollision', source: '/static/models/horn/collision.glb' },

            // // Distinction A
            // { name: 'distinctionAStaticBase', source: '/static/models/distinctionA/static/base.glb' },
            // { name: 'distinctionAStaticCollision', source: '/static/models/distinctionA/static/collision.glb' },
            // { name: 'distinctionAStaticFloorShadow', source: '/static/models/distinctionA/static/floorShadow.png', type: 'texture' },

            // // Distinction B
            // { name: 'distinctionBStaticBase', source: '/static/models/distinctionB/static/base.glb' },
            // { name: 'distinctionBStaticCollision', source: '/static/models/distinctionB/static/collision.glb' },
            // { name: 'distinctionBStaticFloorShadow', source: '/static/models/distinctionB/static/floorShadow.png', type: 'texture' },

            // // Distinction C
            // { name: 'distinctionCStaticBase', source: '/static/models/distinctionC/static/base.glb' },
            // { name: 'distinctionCStaticCollision', source: '/static/models/distinctionC/static/collision.glb' },
            // { name: 'distinctionCStaticFloorShadow', source: '/static/models/distinctionC/static/floorShadow.png', type: 'texture' },

            // // Cone
            // { name: 'coneBase', source: '/static/models/cone/base.glb' },
            // { name: 'coneCollision', source: '/static/models/cone/collision.glb' },

            // // Awwwards trophy
            // { name: 'awwwardsTrophyBase', source: '/static/models/awwwardsTrophy/base.glb' },
            // { name: 'awwwardsTrophyCollision', source: '/static/models/awwwardsTrophy/collision.glb' },

            // Webby trophy
            { name: 'webbyTrophyBase', source: '/static/models/webbyTrophy/base.glb' },
            { name: 'webbyTrophyCollision', source: '/static/models/webbyTrophy/collision.glb' },

            // Lemon
            { name: 'lemonBase', source: '/static/models/lemon/base.glb' },
            { name: 'lemonCollision', source: '/static/models/lemon/collision.glb' },

            // Bownling ball
            { name: 'bowlingBallBase', source: '/static/models/bowlingBall/base.glb' },
            { name: 'bowlingBallCollision', source: '/static/models/bowlingBall/collision.glb' },

            // Bownling ball
            { name: 'bowlingPinBase', source: '/static/models/bowlingPin/base.glb' },
            { name: 'bowlingPinCollision', source: '/static/models/bowlingPin/collision.glb' },

            // Areas
            { name: 'areaKeyEnter', source: '/static/models/area/keyEnter.png', type: 'texture' },
            { name: 'areaEnter', source: '/static/models/area/enter.png', type: 'texture' },
            { name: 'areaOpen', source: '/static/models/area/open.png', type: 'texture' },
            { name: 'areaReset', source: '/static/models/area/reset.png', type: 'texture' },
            { name: 'areaQuestionMark', source: '/static/models/area/questionMark.png', type: 'texture' },

            // Tiles
            { name: 'tilesABase', source: '/static/models/tiles/a/base.glb' },
            { name: 'tilesACollision', source: '/static/models/tiles/a/collision.glb' },

            { name: 'tilesBBase', source: '/static/models/tiles/b/base.glb' },
            { name: 'tilesBCollision', source: '/static/models/tiles/b/collision.glb' },

            { name: 'tilesCBase', source: '/static/models/tiles/c/base.glb' },
            { name: 'tilesCCollision', source: '/static/models/tiles/c/collision.glb' },

            { name: 'tilesDBase', source: '/static/models/tiles/d/base.glb' },
            { name: 'tilesDCollision', source: '/static/models/tiles/d/collision.glb' },

            { name: 'tilesEBase', source: '/static/models/tiles/e/base.glb' },
            { name: 'tilesECollision', source: '/static/models/tiles/e/collision.glb' },

            // Konami
            { name: 'konamiLabel', source: '/static/models/konami/label.png', type: 'texture' },
            { name: 'konamiLabelTouch', source: '/static/models/konami/label-touch.png', type: 'texture' },

            // Wigs
            { name: 'wig1', source: '/static/models/wigs/wig1.glb' },
            { name: 'wig2', source: '/static/models/wigs/wig2.glb' },
            { name: 'wig3', source: '/static/models/wigs/wig3.glb' },
            { name: 'wig4', source: '/static/models/wigs/wig4.glb' },

            // // Egg
            // { name: 'eggBase', source: '/static/models/egg/base.glb' },
            // { name: 'eggCollision', source: '/static/models/egg/collision.glb' },
        ])

        this.loader.on('fileEnd', (_resource, _data) =>
        {
            this.items[_resource.name] = _data

            // Texture
            if(_resource.type === 'texture')
            {
                const texture = new THREE.Texture(_data)
                texture.needsUpdate = true

                this.items[`${_resource.name}Texture`] = texture
            }

            // Trigger progress
            this.trigger('progress', [this.loader.loaded / this.loader.toLoad])
        })

        this.loader.on('end', () =>
        {
            // Trigger ready
            this.trigger('ready')
        })
    }
}
