import React from 'react';
import swal from 'sweetalert';

class HelperText extends React.Component {
    
    _showHelperText() {
        
        let text = '<p><b>3d</b> is an in-browser experiment by <a href="https://twitter.com/scottpdonaldson">Scottland</a> using three.js and Firebase.</p><p><b>Right click and drag</b> to rotate the camera.</p><p><b>Left click and drag</b> to pan the camera.</p>';
        
        if ( !auth.getUser() ) {
            text += '<p>Once you log in, you can create zones of your own!</p>';
        } else {
            text += '<p><b>Click</b> to create a new block.';
            text += '<p><b>Shift + click</b> to remove a block.</p>';
            text += '<p>Have fun!</p>';
        }

        swal({
            title: '3d',
            allowOutsideClick: true,
            showConfirmButton: false,
            text,
            animation: "slide-from-top",
            html: true,
            customClass: 'alignleft'
        });
    }

    render() {
        return (
            <div className="help">
                <span onClick={this._showHelperText}>?</span>
            </div>
        );
    }
}

export default HelperText;