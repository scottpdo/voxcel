var gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    source = require('vinyl-source-stream'),
    awspublish = require('gulp-awspublish'),
    buffer = require('vinyl-buffer'),
    browserSync = require('browser-sync').create();
var reload = browserSync.reload;

// ----- Config

var aws = require('./aws.json');

var paths = {
    jsIn: 'js/src',
    jsOut: 'js/dist',
    cssIn: 'scss/**/*.scss',
    cssOut: 'css',
    html: ['./index.html']
};

paths.jsFiles = ['init'];

paths.jsFiles.forEach(function(path, i) {
    paths.jsFiles[i] = paths.jsIn + '/' + paths.jsFiles[i] + '.js';
});

var site = {
    'index.html': '',
    'css/style.css': 'css',
    'js/dist/script.min.js': 'js/dist'
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
        .pipe(gulp.dest( paths.cssOut ))
        .pipe(reload({ stream: true }));

}

gulp.task('css', css);

function js() {

    browserify('js/src/init.js').bundle()
        .pipe(source('script.js'))
        .pipe(gulp.dest('js/dist'));

    browserify('js/src/init.js').bundle()
        .pipe(source('script.min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('js/dist'));
}

gulp.task('js', js);

gulp.task('publish', function() {

    var publisher = awspublish.create({
        params: {
            Bucket: aws.bucket
        },
        accessKeyId: aws.key,
        secretAccessKey: aws.secret
    });

    css();
    js();

    for ( var key in site ) {
        gulp.src(key)
            .pipe(gulp.dest('site/' + site[key]))
    }

    gulp.src('site/**/*')
        .pipe(publisher.publish())
        .pipe(publisher.sync())
        .pipe(awspublish.reporter());

});

gulp.task('watch', ['css', 'js'], function() {

    gulp.watch( 'scss/**/*.scss', ['css']).on('change', function() {
        css();
        reload();
    });
    gulp.watch( 'js/src/**/*.js', ['js'] ).on('change', function() {
        js();
        reload();
    });
    gulp.watch( paths.html ).on('change', reload);

    browserSync.init({
        server: {
            baseDir: './'
        }
    });

    for ( var key in site ) {
        gulp.src(key)
            .pipe(gulp.dest('site/' + site[key]))
    }
});

gulp.task('default', ['css', 'js', 'watch']);
