var _ = require('lodash'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    awspublish = require('gulp-awspublish'),
    buffer = require('vinyl-buffer'),
    browserSync = require('browser-sync').create(),
    babelify = require('babelify'),
    watchify = require('watchify'),
    server = require('./server.js');

// ----- Config

var aws = require('./aws.json');

var paths = {
    jsIn: 'js/src/main.js',
    jsOut: 'js/dist',
    cssIn: 'scss/**/*.scss',
    cssOut: 'css',
    html: ['./index.html']
};

var site = {
    'index.html': '',
    'css/style.css': 'css',
    'js/dist/script.min.js': 'js/dist',
    'img/**/*': 'img'
};

function css() {

    var processors = [
        autoprefixer('last 2 versions')
    ];

    gulp.src( paths.cssIn )
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest( paths.cssOut ));

}

gulp.task('css', css);

function build(watch) {

    var bundler;

    if ( watch ) {
        bundler = watchify(
            browserify(paths.jsIn,
                _.assign(watchify.args, {
                    debug: true
                })
            )
        );

        bundler.on('update', bundle);
    } else {
        bundler = browserify(paths.jsIn, {
            debug: true
        });
    }

    bundler.on('error', function(error) {
        console.log('Browserify error', error);
    });

    function bundle() {

        console.log('Bundle...');

        var hrTime = process.hrtime();
        var t1 = hrTime[0] * 1000 + hrTime[1] / 1000000;

        bundler
            .transform('babelify', {
                presets: ['es2015', 'react']
            })
            .bundle()
            .pipe(source('script.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({
                loadMaps: true
            }))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('js/dist'));

        if ( !watch ) {
            bundler
                .transform('babelify', {
                    presets: ['es2015', 'react']
                })
                .bundle()
                .pipe(source('script.min.js'))
                .pipe(buffer())
                .pipe(uglify())
                .pipe(gulp.dest('js/dist'));
        }

        hrTime = process.hrtime();
        var t2 = hrTime[0] * 1000 + hrTime[1] / 1000000;

        console.log('Bundle took ' + Math.round(t2 - t1) + ' ms');

    }

    return bundle();
}

gulp.task('build', function() {
    build();
});

gulp.task('build-watch', function() {
    build(true);
});

gulp.task('publish', function() {

    var publisher = awspublish.create({
        params: {
            Bucket: aws.bucket
        },
        accessKeyId: aws.key,
        secretAccessKey: aws.secret
    });

    for ( var key in site ) {
        gulp.src(key)
            .pipe(gulp.dest('site/' + site[key]))
    }

    gulp.src('site/**/*')
        .pipe(publisher.publish())
        .pipe(publisher.sync())
        .pipe(awspublish.reporter());

});

gulp.task('watch', ['css', 'build-watch'], function() {
    gulp.watch('./scss/*.scss', ['css']);
});

gulp.task('serve', ['watch'], function() {
    server.start();
});

gulp.task('default', ['css', 'build', 'serve']);
