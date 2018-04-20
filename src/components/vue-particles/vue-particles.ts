import { Component, Vue, Prop } from 'vue-property-decorator'
import { create } from 'domain'
import { particlesData } from './particles-data'

@Component({
  template: require('./vue-particles.html')
})

export class VueParticles extends Vue {
  id: string = 'particles-instance-' + Math.floor(Math.random() * 5000)

  @Prop({ default: '#dedede' }) color: string

  @Prop({ default: 0.7 }) particleOpacity: number

  @Prop({ default: 80 }) particlesNumber: number

  @Prop({ default: 'circle' }) shapeType: string

  @Prop({ default: 4 }) particleSize: number

  @Prop({ default: '#dedede' }) linesColor: string

  @Prop({ default: 1 }) linesWidth: number

  @Prop({ default: true }) lineLinked: boolean

  @Prop({ default: 0.4 }) lineOpacity: number

  @Prop({ default: 150 }) linesDistance: number

  @Prop({ default: 3 }) moveSpeed: number

  @Prop({ default: true }) hoverEffect: boolean

  @Prop({ default: 'grab' }) hoverMode: string

  @Prop({ default: true }) clickEffect: boolean

  @Prop({ default: 'push' }) clickMode: string

  mounted () {
    require('particles.js')
    this.$nextTick(() => {
      this.initParticleJs(
        this.color,
        this.particleOpacity,
        this.particlesNumber,
        this.shapeType,
        this.particleSize,
        this.linesColor,
        this.linesWidth,
        this.lineLinked,
        this.lineOpacity,
        this.linesDistance,
        this.moveSpeed,
        this.hoverEffect,
        this.hoverMode,
        this.clickEffect,
        this.clickMode
      )
    })
  }

  initParticleJs (
    color,
    particleOpacity,
    particlesNumber,
    shapeType,
    particleSize,
    linesColor,
    linesWidth,
    lineLinked,
    lineOpacity,
    linesDistance,
    moveSpeed,
    hoverEffect,
    hoverMode,
    clickEffect,
    clickMode
  ) {
    particlesJS(this.id, {
      'particles': {
        'number': {
          'value': particlesNumber,
          'density': {
            'enable': true,
            'value_area': 800
          }
        },
        'color': {
          'value': color
        },
        'shape': {
          // circle, edge, triangle, polygon, star, image
          'type': shapeType,
          'stroke': {
            'width': 0,
            'color': '#192231'
          },
          'polygon': {
            'nb_sides': 5
          }
        },
        'opacity': {
          'value': particleOpacity,
          'random': false,
          'anim': {
            'enable': false,
            'speed': 1,
            'opacity_min': 0.1,
            'sync': false
          }
        },
        'size': {
          'value': particleSize,
          'random': true,
          'anim': {
            'enable': false,
            'speed': 40,
            'size_min': 0.1,
            'sync': false
          }
        },
        'line_linked': {
          'enable': lineLinked,
          'distance': linesDistance,
          'color': linesColor,
          'opacity': lineOpacity,
          'width': linesWidth
        },
        'move': {
          'enable': true,
          'speed': moveSpeed,
          'direction': 'none',
          'random': false,
          'straight': false,
          'out_mode': 'out',
          'bounce': false,
          'attract': {
            'enable': false,
            'rotateX': 600,
            'rotateY': 1200
          }
        }
      },
      'interactivity': {
        'detect_on': 'canvas',
        'events': {
          'onhover': {
            'enable': hoverEffect,
            'mode': hoverMode
          },
          'onclick': {
            'enable': clickEffect,
            'mode': clickMode
          },
          'onresize': {

            'enable': true,
            'density_auto': true,
            'density_area': 400

          }
        },
        'modes': {
          'grab': {
            'distance': 140,
            'line_linked': {
              'opacity': 1
            }
          },
          'bubble': {
            'distance': 400,
            'size': 40,
            'duration': 2,
            'opacity': 8,
            'speed': 3
          },
          'repulse': {
            'distance': 200,
            'duration': 0.4
          },
          'push': {
            'particles_nb': 4
          },
          'remove': {
            'particles_nb': 2
          }
        }
      },
      'retina_detect': true
    })
  }
}
